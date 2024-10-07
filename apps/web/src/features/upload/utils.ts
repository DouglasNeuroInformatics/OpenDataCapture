import { isNumberLike, isPlainObject, parseNumber } from '@douglasneuroinformatics/libjs';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { z } from 'zod';

const ZOD_TYPE_NAMES = ['ZodNumber', 'ZodString', 'ZodBoolean', 'ZodOptional', 'ZodSet', 'ZodDate', 'ZodEnum'] as const;
const INTERNAL_HEADERS = ['subjectID', 'date'];
const MONGOLIAN_VOWEL_SEPARATOR = String.fromCharCode(32, 6158);
const INTERNAL_HEADERS_SAMPLE_DATA = [MONGOLIAN_VOWEL_SEPARATOR + 'string', MONGOLIAN_VOWEL_SEPARATOR + 'yyyy-mm-dd'];
// csvColumns += 'mouseNumber-LabHead-ProjectLead,yyyy-mm-dd' + sampleData + '\n';

type ZodTypeName = (typeof ZOD_TYPE_NAMES)[number];

type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodOptional'>;

type ZodTypeNameResult =
  | {
      isOptional: boolean;
      success: true;
      typeName: RequiredZodTypeName;
      enumValues?: any[] | unknown | undefined;
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
        isOptional: Boolean(isOptional),
        success: true,
        typeName: def.typeName as RequiredZodTypeName,
        enumValues: def.values as any[]
      };
    }
    return { isOptional: Boolean(isOptional), success: true, typeName: def.typeName as RequiredZodTypeName };
  }
  console.error(`Cannot parse ZodType from schema: ${JSON.stringify(schema)}`);
  return { message: 'Unexpected Error', success: false };
}

export function valueInterpreter(
  entry: string,
  zType: Exclude<ZodTypeName, 'ZodOptional'>,
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
      return { message: 'Undecipherable Boolean Type', success: false };
    case 'ZodDate':
      try {
        return { success: true, value: new Date(entry) };
      } catch (err) {
        console.error(err);
      }
      return { message: `Failed to parse date: ${entry}`, success: false };
    case 'ZodNumber':
      if (isNumberLike(entry)) {
        return { success: true, value: parseNumber(entry) };
      }
      return { message: 'Invalid number type', success: false };
    case 'ZodSet':
      if (entry.includes('SET(')) {
        let setData = entry.slice(4, -1);
        let setDataList = setData.split('\\,');
        return { success: true, value: new Set(setDataList) };
      }
      return { message: 'Invalid ZodSet', success: false };
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

export function applyLineTransforms(line: string) {
  return line.replaceAll(/SET\((.*?)\)/g, (match) => {
    return match.replaceAll(',', '\\,');
  });
}

function formatTypeInfo(s: string, isOptional: boolean) {
  return isOptional ? `${s} (optional)` : s;
}

function sampleDataGenerator({ isOptional, typeName, enumValues }: Extract<ZodTypeNameResult, { success: true }>) {
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
        for (const val of enumValues as any[]) {
          possibleEnumOutputs += val + '/';
        }
        return formatTypeInfo(possibleEnumOutputs, isOptional);
      } catch {
        throw new Error('Invalid Enum error');
      }

    default:
      throw new Error(`Invalid zod schema: unexpected type name '${typeName satisfies never}'`);
  }
}

export function enumGenerator(instrument: AnyUnilingualFormInstrument) {
  const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
  const shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };
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

  return {
    content: csvColumns.join(',') + '\n' + sampleData.join(',') + '\n',
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
      let [headerLine, ...dataLines] = text.split('\n');

      //remove sample data if included
      if (dataLines[0]?.includes(INTERNAL_HEADERS_SAMPLE_DATA.join(','))) {
        dataLines = dataLines.slice(1);
      }

      dataLines = dataLines.filter((str) => str !== '');

      if (dataLines.length === 0) {
        return resolve({ message: 'data lines is empty array', success: false });
      }

      const result: FormTypes.Data[] = [];

      const headers: string[] = headerLine!.split(',');

      if (headers.length === 0) {
        return resolve({ message: 'headers is empty array', success: false });
      }

      for (let line of dataLines) {
        line = applyLineTransforms(line);
        let elements = line.split(',');
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
          const valueInterpreterResult = valueInterpreter(rawValue, typeNameResult.typeName, typeNameResult.isOptional);

          if (!valueInterpreterResult.success) {
            return resolve({ message: valueInterpreterResult.message, success: false });
          }
          jsonLine[headers[j]!] = valueInterpreterResult.value;
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
