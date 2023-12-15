import { z } from 'zod';
import type { VisitModel } from '@open-data-capture/database/core';

import { subjectIdentificationDataSchema, subjectSchema } from './subject';

export type Visit = VisitModel;

export const visitSchema = z.object({
  createdAt: z.coerce.date(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string(),
  subject: subjectSchema,
  groupId: z.string(),
  subjectId: z.string()
}) satisfies Zod.ZodType<VisitModel>;

export const createVisitDataSchema = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: subjectIdentificationDataSchema
});

export type CreateVisitData = z.infer<typeof createVisitDataSchema>;
