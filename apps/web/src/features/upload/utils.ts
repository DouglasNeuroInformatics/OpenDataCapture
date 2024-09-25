import { isNumberLike, isPlainObject, parseNumber } from '@douglasneuroinformatics/libjs';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { z } from 'zod';

const ZOD_TYPE_NAMES = ['ZodNumber', 'ZodString', 'ZodBoolean', 'ZodOptional', 'ZodSet'] as const;

type ZodTypeName = (typeof ZOD_TYPE_NAMES)[number];

type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodOptional'>;

type ZodTypeNameResult =
  | {
      isOptional: boolean;
      success: true;
      typeName: RequiredZodTypeName;
    }
  | {
      message: string;
      success: false;
    };

type ValueInterpreterResult =
  | {
      message: string;
      success: false;
    }
  | {
      success: true;
      value: FormTypes.FieldValue;
    };

export function getZodTypeName(schema: z.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
  const def: unknown = schema._def;
  if (isPlainObject(def) && ZOD_TYPE_NAMES.includes(def.typeName as ZodTypeName)) {
    if (def.typeName === 'ZodOptional') {
      return getZodTypeName(def.innerType as z.ZodTypeAny, true);
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
): ValueInterpreterResult {
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
      return { message: '', success: false };
    case 'ZodNumber':
      if (isNumberLike(entry)) {
        return { success: true, value: parseNumber(entry) };
      }
      return { message: '', success: false };
    case 'ZodSet':
      if (entry.includes('SET(')) {
        let setData = entry.slice(4, -1);
        let setDataList = setData.split('\\,');
        return { success: true, value: new Set(setDataList) };
      }
      return { message: '', success: false };
    case 'ZodString':
      return { success: true, value: entry };
    default:
      return { message: `Invalid ZodType: ${zType satisfies never}`, success: false };
  }
}

export function applyLineTransforms(line: string) {
  return line.replaceAll(/SET\((.*?)\)/g, (match) => {
    return match.replaceAll(',', '\\,');
  });
}
