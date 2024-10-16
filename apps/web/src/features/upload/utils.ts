import { isNumberLike, isPlainObject, parseNumber } from '@douglasneuroinformatics/libjs';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { parse, unparse } from 'papaparse';
import { z } from 'zod';

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
// csvColumns += 'mouseNumber-LabHead-ProjectLead,yyyy-mm-dd' + sampleData + '\n';

type ZodTypeName = (typeof ZOD_TYPE_NAMES)[number];

type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodOptional'>;

type ZodTypeNameResult =
  | {
      enumValues?: any[] | undefined;
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

export function getZodTypeName(schema: z.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
  const def: unknown = schema._def;
  if (isPlainObject(def) && ZOD_TYPE_NAMES.includes(def.typeName as ZodTypeName)) {
    if (def.typeName === 'ZodOptional') {
      return getZodTypeName(def.innerType as z.ZodTypeAny, true);
    } else if (def.typeName === 'ZodEnum') {
      return {
        enumValues: def.values as any[],
        isOptional: Boolean(isOptional),
        success: true,
        typeName: def.typeName as RequiredZodTypeName
      };
    } else if (def.typeName === 'ZodArray' || def.typeName === 'ZodObject') {
      return zodObjectInterpreter(schema, def.typeName, isOptional);
    }

    return { isOptional: Boolean(isOptional), success: true, typeName: def.typeName as RequiredZodTypeName };
  }
  console.error(`Cannot parse ZodType from schema: ${JSON.stringify(schema)}`);
  return { message: 'Unexpected Error', success: false };
}

export function zodObjectInterpreter(
  schema: z.ZodTypeAny,
  originalName: RequiredZodTypeName,
  isOptional?: boolean
): ZodTypeNameResult {
  const def: unknown = schema._def;
  const listOfZodElements: ZodTypeNameResult[] = [];
  const listOfZodKeys: string[] = [];
  const shape = def.type.shape as { [key: string]: z.ZodTypeAny };

  for (const [key, insideType] of Object.entries(shape)) {
    if (ZOD_TYPE_NAMES.includes(insideType._def.typeName as ZodTypeName)) {
      const innerTypeName = getZodTypeName(insideType);
      listOfZodElements.push(innerTypeName);
      listOfZodKeys.push(key);
    }
  }
  if (listOfZodElements.length > 0) {
    return {
      isOptional: Boolean(isOptional),
      multiKeys: listOfZodKeys,
      multiValues: listOfZodElements,
      success: true,
      typeName: originalName
    };
  }

  return { message: 'Failure to interpret Zod Object or Array', success: false };
}

export function valueInterpreter(
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
    case 'ZodNumber':
      if (isNumberLike(entry)) {
        return { success: true, value: parseNumber(entry) };
      }
      return { message: `Invalid number type: ${entry}`, success: false };
    case 'ZodSet':
      if (entry.includes('SET(')) {
        let setData = entry.slice(4, -1);
        let setDataList = setData.split(',');
        return { success: true, value: new Set(setDataList) };
      }
      return { message: `Invalid ZodSet: ${entry}`, success: false };
    case 'ZodString':
      return { success: true, value: entry };
    case 'ZodEnum':
      if (entry.toLowerCase() === 'true' || entry.toLowerCase() === 'false') {
        return valueInterpreter(entry, 'ZodBoolean', isOptional);
      } else if (isNumberLike(entry)) {
        return { success: true, value: parseNumber(entry) };
      } else if (Date.parse(entry)) {
        return valueInterpreter(entry, 'ZodDate', isOptional);
      } else {
        return valueInterpreter(entry, 'ZodString', isOptional);
      }

    default:
      return { message: `Invalid ZodType: ${zType satisfies never}`, success: false };
  }
}

export function ObjectValueInterpreter(
  entry: string,
  isOptional: boolean,
  zList: ZodTypeNameResult[],
  zKeys: string[]
): UploadOperationResult<FormTypes.FieldValue> {
  if (entry === '' && isOptional) {
    return { success: true, value: undefined };
  }
  if (entry.includes('RECORD_ARRAY(') && zList && zKeys) {
    let recordArray = [];

    let recordArrayDataEntry = entry.slice(13, -2);

    let recordArrayDataList = recordArrayDataEntry.split(';');

    const popElm = recordArrayDataList.pop();
    if (popElm !== '' && popElm) {
      recordArrayDataList.push(popElm);
    }

    for (const listData of recordArrayDataList) {
      let recordArrayObject: { [key: string]: any } = {};
      let record = listData.split(',');

      for (let i = 0; i < record.length; i++) {
        let recordValue = record[i]!.split(':')[1]!;
        const zListResult = zList[i]!;
        if (zListResult.success && zListResult.typeName !== 'ZodArray' && zListResult.typeName !== 'ZodObject') {
          const valueInterpreterResult: UploadOperationResult<FormTypes.FieldValue> = valueInterpreter(
            recordValue,
            zListResult.typeName,
            zListResult.isOptional
          );
          // eslint-disable-next-line max-depth
          if (valueInterpreterResult.success) {
            recordArrayObject[zKeys[i]!] = valueInterpreterResult.value;
          } else {
            return {
              message: `failed to interpret value at entry ${i} in record array row ${listData}`,
              success: false
            };
          }
        } else {
          return { message: `Failed to interpret field '${i}'`, success: false };
        }
      }
      recordArray.push(recordArrayObject);
    }

    return { success: true, value: recordArray };
  }

  return { message: `Invalid ZodType`, success: false };
}

function formatTypeInfo(s: string, isOptional: boolean) {
  return isOptional ? `${s} (optional)` : s;
}

function sampleDataGenerator({
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
      return formatTypeInfo('SET(a,b,c)', isOptional);
    case 'ZodString':
      return formatTypeInfo('string', isOptional);
    case 'ZodEnum':
      try {
        let possibleEnumOutputs = '';
        for (const val of enumValues!) {
          possibleEnumOutputs += val + '/';
        }
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
            // eslint-disable-next-line max-depth
            if (i === multiValues.length - 1 && multiValues[i] !== undefined) {
              multiString += multiKeys[i] + ':' + sampleDataGenerator(multiValues[i]);
            } else {
              multiString += multiKeys[i] + ':' + sampleDataGenerator(multiValues[i]) + ',';
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
  const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
  const shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };

  const columnNames = Object.keys(instrumentSchema.shape as z.AnyZodObject);

  const csvColumns = INTERNAL_HEADERS.concat(columnNames);

  const sampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];
  for (const col of columnNames) {
    const typeNameResult = getZodTypeName(shape[col]!);
    if (!typeNameResult.success) {
      throw new Error(typeNameResult.message);
    }
    sampleData.push(sampleDataGenerator(typeNameResult));
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
  // const shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };
  const instrumentSchemaWithInternal = instrumentSchema.extend({
    date: z.coerce.date(),
    subjectID: z.string()
  });
  const shape = instrumentSchemaWithInternal.shape as { [key: string]: z.ZodTypeAny };

  return new Promise<UploadOperationResult<FormTypes.Data[]>>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parseResultCsv = parse<string[]>(text, {
        header: false,
        skipEmptyLines: true
      });

      let [headers, ...dataLines] = parseResultCsv.data;

      //remove sample data if included
      if (dataLines[0]?.[0]?.startsWith(MONGOLIAN_VOWEL_SEPARATOR)) {
        dataLines.shift();
      }

      if (dataLines.length === 0) {
        return resolve({ message: 'data lines is empty array', success: false });
      }

      const result: FormTypes.Data[] = [];

      if (headers?.length === 0) {
        return resolve({ message: 'headers is empty array', success: false });
      }

      for (let elements of dataLines) {
        const jsonLine: { [key: string]: unknown } = {};
        for (let j = 0; j < headers!.length; j++) {
          const key = headers![j]!;
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
              interpreterResult = ObjectValueInterpreter(
                rawValue,
                typeNameResult.isOptional,
                typeNameResult.multiValues,
                typeNameResult.multiKeys
              );
          } else {
            interpreterResult = valueInterpreter(rawValue, typeNameResult.typeName, typeNameResult.isOptional);
          }

          if (!interpreterResult.success) {
            return resolve({ message: interpreterResult.message, success: false });
          }
          jsonLine[headers![j]!] = interpreterResult.value;
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
