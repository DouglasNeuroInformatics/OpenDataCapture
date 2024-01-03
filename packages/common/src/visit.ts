import type { VisitModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $Subject, $SubjectIdentificationData } from './subject';

export type Visit = VisitModel;

export const $Visit = z.object({
  createdAt: z.coerce.date(),
  date: z.coerce.date(),
  groupId: z.string(),
  id: z.string(),
  subject: $Subject,
  subjectId: z.string(),
  updatedAt: z.coerce.date()
}) satisfies z.ZodType<VisitModel>;

export const $CreateVisitData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: $SubjectIdentificationData
});

export type CreateVisitData = z.infer<typeof $CreateVisitData>;
