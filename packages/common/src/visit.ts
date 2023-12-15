import { z } from 'zod';
import type { VisitModel } from '@open-data-capture/database/core';

import { $Subject, $SubjectIdentificationData } from './subject';

export type Visit = VisitModel;

export const $Visit = z.object({
  createdAt: z.coerce.date(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string(),
  subject: $Subject,
  groupId: z.string(),
  subjectId: z.string()
}) satisfies Zod.ZodType<VisitModel>;

export const $CreateVisitData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: $SubjectIdentificationData
});

export type CreateVisitData = z.infer<typeof $CreateVisitData>;
