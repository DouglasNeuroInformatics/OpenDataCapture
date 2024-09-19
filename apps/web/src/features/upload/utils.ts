import { isPlainObject } from '@douglasneuroinformatics/libjs';
import type { z } from 'zod';

const ZOD_TYPE_NAMES = ['ZodNumber', 'ZodString', 'ZodBoolean'] as const;

type ZodTypeName = (typeof ZOD_TYPE_NAMES)[number];

export function getZodTypeName(schema: z.ZodTypeAny): null | ZodTypeName {
  const def: unknown = schema._def;
  if (isPlainObject(def) && ZOD_TYPE_NAMES.includes(def.typeName as ZodTypeName)) {
    return def.typeName as ZodTypeName;
  }
  return null;
}
