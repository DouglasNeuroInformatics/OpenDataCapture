import { isNumberLike, isPlainObject, parseNumber } from '@douglasneuroinformatics/libjs';
import type { AnyUnilingualFormInstrument, FormTypes, Json } from '@opendatacapture/runtime-core';
import type { Group } from '@opendatacapture/schemas/group';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { encodeScopedSubjectId } from '@opendatacapture/subject-utils';
import { parse, unparse } from 'papaparse';
import { z } from 'zod';

// TODO - refine ZodTypeNameResult to reflect specific ZodType variants (i.e., object)

// TODO - last thing, convert all errors thrown to result to be handled in the UploadPage component

const ZOD_TYPE_NAMES = [
  'ZodNumber',
  'ZodString',
  'ZodBoolean',
  'ZodOptional',
  'ZodSet',
  'ZodDate',
  'ZodEnum',
  'ZodArray',
  'ZodObject'
] as const;

const INTERNAL_HEADERS = ['subjectID', 'date'];

const MONGOLIAN_VOWEL_SEPARATOR = String.fromCharCode(32, 6158);

const INTERNAL_HEADERS_SAMPLE_DATA = [MONGOLIAN_VOWEL_SEPARATOR + 'string', MONGOLIAN_VOWEL_SEPARATOR + 'yyyy-mm-dd'];

type ZodTypeName = Extract<`${z.ZodFirstPartyTypeKind}`, (typeof ZOD_TYPE_NAMES)[number]>;

type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodOptional'>;

type ZodTypeNameResult =
  | {
      enumValues?: readonly string[];
      isOptional: boolean;
      multiKeys?: string[];
      multiValues?: ZodTypeNameResult[];
      success: true;
      typeName: RequiredZodTypeName;
    }
  | {
      message: string;
      success: false;
    };

type UploadOperationResult<T> =
  | {
      message: string;
      success: false;
    }
  | {
      success: true;
      value: T;
    };

type AnyZodTypeDef = z.ZodTypeDef & { typeName: ZodTypeName };

function isZodTypeDef(value: unknown): value is AnyZodTypeDef {
  return isPlainObject(value) && ZOD_TYPE_NAMES.includes(value.typeName as ZodTypeName);
}

function isZodOptionalDef(def: AnyZodTypeDef): def is z.ZodOptionalDef<z.ZodTypeAny> {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodOptional;
}

function isZodEnumDef(def: AnyZodTypeDef): def is z.ZodEnumDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodEnum;
}

function isZodSetDef(def: AnyZodTypeDef): def is z.ZodSetDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodSet;
}

function isZodArrayDef(def: AnyZodTypeDef): def is z.ZodArrayDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodArray;
}

// TODO - fix extract set and record array functions to handle whitespace and trailing semicolon (present or included)

function extractSetEntry(entry: string) {
  const result = /SET\(\s*(.*?)\s*\)/.exec(entry);
  if (!result?.[1]) {
    throw new Error(`Failed to extract set value from entry: '${entry}'`);
  }
  return result[1];
}

function extractRecordArrayEntry(entry: string) {
  const result = /RECORD_ARRAY\(\s*(.*?)[\s;]*\)/.exec(entry);
  if (!result?.[1]) {
    throw new Error(`Failed to extract record array value from entry: '${entry}'`);
  }
  return result[1];
}

export function reformatInstrumentData({
  currentGroup,
  data,
  instrument
}: {
  currentGroup: Group | null;
  data: FormTypes.Data[];
  instrument: UnilingualInstrumentInfo;
}): UploadInstrumentRecordsData {
  const recordsList: { data: Json; date: Date; subjectId: string }[] = [];
  for (const dataInfo of data) {
    const { date: dataDate, subjectID: dataSubjectId, ...restOfData } = dataInfo; // Destructure and extract the rest of the data
    const createdRecord = {
      data: restOfData as Json,
      date: dataDate as Date,
      subjectId: encodeScopedSubjectId(dataSubjectId as string, {
        groupName: currentGroup?.name ?? 'root'
      })
    };
    recordsList.push(createdRecord);
  }
  const reformatForSending: UploadInstrumentRecordsData = {
    groupId: currentGroup?.id,
    instrumentId: instrument.id,
    records: recordsList
  };
  return reformatForSending;
}

export function getZodTypeName(schema: z.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
  const def: unknown = schema._def;
  if (isZodTypeDef(def)) {
    if (isZodOptionalDef(def)) {
      return getZodTypeName(def.innerType, true);
    } else if (isZodEnumDef(def)) {
      return {
        enumValues: def.values,
        isOptional: Boolean(isOptional),
        success: true,
        typeName: def.typeName
      };
    } else if (isZodArrayDef(def)) {
      return interpretZodArray(schema, def.typeName, isOptional);
    } else if (isZodSetDef(def)) {
      const innerDef: unknown = def.valueType._def;

      if (!isZodTypeDef(innerDef)) {
        return {
          message: 'Invalid inner type: ZodSet value type must have a valid type definition',
          success: false
        };
      }

      if (isZodEnumDef(innerDef)) {
        return {
          enumValues: innerDef.values,
          isOptional: Boolean(isOptional),
          success: true,
          typeName: def.typeName
        };
      }
    }

    return {
      isOptional: Boolean(isOptional),
      success: true,
      typeName: def.typeName satisfies ZodTypeName as RequiredZodTypeName
    };
  }
  console.error(`Cannot parse ZodType from schema: ${JSON.stringify(schema)}`);
  return { message: 'Unexpected Error', success: false };
}

export function interpretZodArray(
  schema: z.ZodTypeAny,
  originalName: z.ZodFirstPartyTypeKind.ZodArray,
  isOptional?: boolean
): ZodTypeNameResult {
  const def: unknown = schema._def;
  const listOfZodElements: ZodTypeNameResult[] = [];
  const listOfZodKeys: string[] = [];

  if (!isZodTypeDef(def)) {
    throw new Error(`Unexpected value for _def in schema: ${JSON.stringify(def)}`);
  } else if (!isZodArrayDef(def)) {
    throw new Error(
      `Unexpected value '${def.typeName}' for property _def.typeName in schema: must be '${z.ZodFirstPartyTypeKind.ZodArray}'`
    );
  }

  // TODO - check zod array inner type is object
  const shape = (def.type as z.AnyZodObject).shape as { [key: string]: z.ZodTypeAny };

  for (const [key, insideType] of Object.entries(shape)) {
    const def: unknown = insideType._def;
    if (isZodTypeDef(def)) {
      const innerTypeName = getZodTypeName(insideType);
      listOfZodElements.push(innerTypeName);
      listOfZodKeys.push(key);
    } else {
      console.error({ def });
      throw new Error(`Unhandled case!`);
    }
  }

  if (listOfZodElements.length === 0) {
    return { message: 'Failure to interpret Zod Object or Array', success: false };
  }

  return {
    isOptional: Boolean(isOptional),
    multiKeys: listOfZodKeys,
    multiValues: listOfZodElements,
    success: true,
    typeName: originalName
  };
}

export function interpretZodValue(
  entry: string,
  zType: Exclude<ZodTypeName, 'ZodArray' | 'ZodObject' | 'ZodOptional'>,
  isOptional: boolean
): UploadOperationResult<FormTypes.FieldValue> {
  if (entry === '' && isOptional) {
    return { success: true, value: undefined };
  }
  switch (zType) {
    case 'ZodBoolean':
      if (entry.toLowerCase() === 'true') {
        return { success: true, value: true };
      } else if (entry.toLowerCase() === 'false') {
        return { success: true, value: false };
      }
      return { message: `Undecipherable Boolean Type: ${entry}`, success: false };
    case 'ZodDate': {
      const date = new Date(entry);
      if (isNaN(date.getTime())) {
        return { message: `Failed to parse date: ${entry}`, success: false };
      }
      return { success: true, value: date };
    }
    case 'ZodEnum':
      return interpretZodValue(entry, 'ZodString', isOptional);
    case 'ZodNumber':
      if (isNumberLike(entry)) {
        return { success: true, value: parseNumber(entry) };
      }
      return { message: `Invalid number type: ${entry}`, success: false };
    //TODO if ZodSet has a enum see if those values can be shown in template data if possible
    case 'ZodSet':
      if (entry.startsWith('SET(')) {
        const setData = extractSetEntry(entry);
        return { success: true, value: new Set(setData.split(',').map((s) => s.trim())) };
      }
      return { message: `Invalid ZodSet: ${entry}`, success: false };
    case 'ZodString':
      return { success: true, value: entry };
    default:
      return { message: `Invalid ZodType: ${zType satisfies never}`, success: false };
  }
}

export function interpretZodObjectValue(
  entry: string,
  isOptional: boolean,
  zList: ZodTypeNameResult[],
  zKeys: string[]
): UploadOperationResult<FormTypes.FieldValue> {
  if (entry === '' && isOptional) {
    return { success: true, value: undefined };
  } else if (!entry.startsWith('RECORD_ARRAY(')) {
    return { message: `Invalid ZodType`, success: false };
  }

  const recordArray: { [key: string]: any }[] = [];
  const recordArrayDataEntry = extractRecordArrayEntry(entry);
  const recordArrayDataList = recordArrayDataEntry.split(';');

  if (recordArrayDataList.at(-1) === '') {
    recordArrayDataList.pop();
  }

  for (const listData of recordArrayDataList) {
    const recordArrayObject: { [key: string]: any } = {};

    const record = listData.split(',');
    if (record.some((str) => str === '')) {
      return { message: `One or more of the record array fields was left empty`, success: false };
    }
    if (!(zList.length === zKeys.length && zList.length === record.length)) {
      return { message: `Incorrect number of entries for record array`, success: false };
    }
    for (let i = 0; i < record.length; i++) {
      // TODO - make sure this is defined
      const recordValue = record[i]!.split(':')[1]!.trim();

      const zListResult = zList[i]!;
      if (!(zListResult.success && zListResult.typeName !== 'ZodArray' && zListResult.typeName !== 'ZodObject')) {
        return { message: `Failed to interpret field '${i}'`, success: false };
      }
      const interpretZodValueResult: UploadOperationResult<FormTypes.FieldValue> = interpretZodValue(
        recordValue,
        zListResult.typeName,
        zListResult.isOptional
      );
      if (!interpretZodValueResult.success) {
        return {
          message: `failed to interpret value at entry ${i} in record array row ${listData}`,
          success: false
        };
      }

      recordArrayObject[zKeys[i]!] = interpretZodValueResult.value;
    }
    recordArray.push(recordArrayObject);
  }

  return { success: true, value: recordArray };
}

function formatTypeInfo(s: string, isOptional: boolean) {
  return isOptional ? `${s} (optional)` : s;
}

function generateSampleData({
  enumValues,
  isOptional,
  multiKeys,
  multiValues,
  typeName
}: Extract<ZodTypeNameResult, { success: true }>) {
  switch (typeName) {
    case 'ZodBoolean':
      return formatTypeInfo('true/false', isOptional);
    case 'ZodDate':
      return formatTypeInfo('yyyy-mm-dd', isOptional);
    case 'ZodNumber':
      return formatTypeInfo('number', isOptional);
    case 'ZodSet':
      try {
        if (enumValues) {
          const enumString = enumValues.join('/');
          const possibleEnumOutputs = `SET(${enumString}, ...)`;
          return formatTypeInfo(possibleEnumOutputs, isOptional);
        }

        return formatTypeInfo('SET(a,b,c)', isOptional);
      } catch {
        throw new Error(`Failed to generate sample data for ZodSet`);
      }

    case 'ZodString':
      return formatTypeInfo('string', isOptional);
    case 'ZodEnum':
      try {
        let possibleEnumOutputs = '';
        for (const val of enumValues!) {
          possibleEnumOutputs += val + '/';
        }
        possibleEnumOutputs = possibleEnumOutputs.slice(0, -1);
        return formatTypeInfo(possibleEnumOutputs, isOptional);
      } catch {
        throw new Error('Invalid Enum error');
      }
    case 'ZodArray':
    case 'ZodObject':
      try {
        let multiString = 'RECORD_ARRAY( ';
        if (multiValues && multiKeys) {
          for (let i = 0; i < multiValues.length; i++) {
            const inputData = multiValues[i];
            // eslint-disable-next-line max-depth
            if (!inputData?.success) {
              console.error({ inputData });
              throw new Error(`TODO - handle this case where input data is undefined or not a success`);
            }
            // eslint-disable-next-line max-depth
            if (i === multiValues.length - 1 && multiValues[i] !== undefined) {
              multiString += multiKeys[i] + ':' + generateSampleData(inputData);
            } else {
              multiString += multiKeys[i] + ':' + generateSampleData(inputData) + ',';
            }
          }
          multiString += ';)';
        }

        return multiString;
      } catch {
        throw new Error('Invalid Record Array Error');
      }

    default:
      throw new Error(`Invalid zod schema: unexpected type name '${typeName satisfies never}'`);
  }
}

export function createUploadTemplateCSV(instrument: AnyUnilingualFormInstrument) {
  // TODO - type validationSchema as object
  const instrumentSchema = instrument.validationSchema as z.AnyZodObject;

  let shape: { [key: string]: z.ZodTypeAny } = {};
  // TODO - include ZodEffect as a typename like our other types
  if ((instrumentSchema._def.typeName as string) === 'ZodEffects') {
    // @ts-expect-error - TODO - find a type safe way to call this
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    shape = instrumentSchema._def.schema._def.shape() as { [key: string]: z.ZodTypeAny };
  } else {
    shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };
  }

  const columnNames = Object.keys(shape);

  const csvColumns = INTERNAL_HEADERS.concat(columnNames);

  const sampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];
  for (const col of columnNames) {
    const typeNameResult = getZodTypeName(shape[col]!);
    if (!typeNameResult.success) {
      throw new Error(typeNameResult.message);
    }
    sampleData.push(generateSampleData(typeNameResult));
  }

  unparse([csvColumns, sampleData]);

  return {
    content: unparse([csvColumns, sampleData]),
    fileName: `${instrument.internal.name}_${instrument.internal.edition}_template.csv`
  };
}

export async function processInstrumentCSV(
  input: File,
  instrument: AnyUnilingualFormInstrument
): Promise<UploadOperationResult<FormTypes.Data[]>> {
  const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
  let shape: { [key: string]: z.ZodTypeAny } = {};
  let instrumentSchemaWithInternal: z.AnyZodObject;

  if ((instrumentSchema._def.typeName as string) === 'ZodEffects') {
    // @ts-expect-error - TODO - find a type safe way to call this
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    instrumentSchemaWithInternal = instrumentSchema._def.schema.extend({
      date: z.coerce.date(),
      subjectID: z.string()
    }) as z.AnyZodObject;

    shape = instrumentSchemaWithInternal._def.shape() as { [key: string]: z.ZodTypeAny };
  } else {
    instrumentSchemaWithInternal = instrumentSchema.extend({
      date: z.coerce.date(),
      subjectID: z.string()
    });
    shape = instrumentSchemaWithInternal.shape as { [key: string]: z.ZodTypeAny };
  }

  return new Promise<UploadOperationResult<FormTypes.Data[]>>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parseResultCsv = parse<string[]>(text, {
        header: false,
        skipEmptyLines: true
      });

      const [headers, ...dataLines] = parseResultCsv.data;

      //remove sample data if included
      if (dataLines[0]?.[0]?.startsWith(MONGOLIAN_VOWEL_SEPARATOR)) {
        dataLines.shift();
      }

      if (dataLines.length === 0) {
        return resolve({ message: 'data lines is empty array', success: false });
      }

      const result: FormTypes.Data[] = [];

      if (!headers?.length) {
        return resolve({ message: 'headers is undefined or empty array', success: false });
      }

      for (const elements of dataLines) {
        const jsonLine: { [key: string]: unknown } = {};
        for (let j = 0; j < headers.length; j++) {
          const key = headers[j]!;
          const rawValue = elements[j]!;

          if (rawValue === '\n') {
            continue;
          }
          if (shape[key] === undefined) {
            return resolve({ message: `Schema at '${key}' is not defined!`, success: false });
          }
          const typeNameResult = getZodTypeName(shape[key]);
          if (!typeNameResult.success) {
            return resolve({ message: typeNameResult.message, success: false });
          }

          let interpreterResult: UploadOperationResult<FormTypes.FieldValue> = {
            message: 'Could not interpret a correct value',
            success: false
          };

          if (typeNameResult.typeName === 'ZodArray' || typeNameResult.typeName === 'ZodObject') {
            if (typeNameResult.multiKeys && typeNameResult.multiValues)
              interpreterResult = interpretZodObjectValue(
                rawValue,
                typeNameResult.isOptional,
                typeNameResult.multiValues,
                typeNameResult.multiKeys
              );
            // TODO - what if this is not the case? Once generics are handled correctly should not be a problem
          } else {
            interpreterResult = interpretZodValue(rawValue, typeNameResult.typeName, typeNameResult.isOptional);
          }
          if (!interpreterResult.success) {
            return resolve({ message: interpreterResult.message, success: false });
          }
          jsonLine[headers[j]!] = interpreterResult.value;
        }
        const zodCheck = instrumentSchemaWithInternal.safeParse(jsonLine);
        if (!zodCheck.success) {
          //create error message with zodcheck error messsage + zodcheck error path
          //addNotification({ message: zodCheck.error.issues[0]?.message, type: 'error' });
          console.error(zodCheck.error.issues);
          console.error(`Failed to parse data: ${JSON.stringify(jsonLine)}`);
          return resolve({ message: zodCheck.error.message, success: false });
        }
        result.push(zodCheck.data);
      }
      resolve({ success: true, value: result });
    };
    reader.readAsText(input);
  });
}
