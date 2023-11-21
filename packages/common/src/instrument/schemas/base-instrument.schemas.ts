import { z } from 'zod';

import { languageSchema } from '../../core/core.schemas';

import type * as Types from '../instrument.types';

const instrumentKindSchema = z.enum(['form']) satisfies Zod.ZodType<Types.InstrumentKind>;

export const translatedSchema = <T extends Zod.ZodType>(schema: T) =>
  z.union([
    schema,
    z.object({
      en: schema,
      fr: schema
    })
  ]);

export const baseInstrumentDetailsSchema = z.object({
  description: translatedSchema(z.string().min(1)),
  title: translatedSchema(z.string().min(1))
}) satisfies Zod.ZodType<Types.BaseInstrumentDetails>;

export const baseInstrumentSchema = z.object({
  content: z.unknown(),
  details: baseInstrumentDetailsSchema,
  id: z.string().optional(),
  kind: instrumentKindSchema,
  language: z.union([languageSchema, z.array(languageSchema)]),
  name: z.string().min(1),
  tags: translatedSchema(z.array(z.string().min(1))),
  validationSchema: z.instanceof(z.ZodType),
  version: z.number()
}) satisfies Zod.ZodType<Types.BaseInstrument>;

export const instrumentSummarySchema = baseInstrumentSchema.omit({
  content: true,
  validationSchema: true
}) satisfies Zod.ZodType<Types.InstrumentSummary>;

export const instrumentSourceSchema = z.object({
  source: z.string()
}) satisfies Zod.ZodType<Types.InstrumentSource>;

export const instrumentSourceContainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  version: z.number()
});

export type InstrumentSourceContainer = z.infer<typeof instrumentSourceContainerSchema>;
