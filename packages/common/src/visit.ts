import type { VisitModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';
import { $Subject, $SubjectIdentificationData } from './subject';

export type Visit = VisitModel;
export const $Visit = $BaseModel.extend({
  date: z.coerce.date(),
  groupId: z.string(),
  subject: $Subject,
  subjectId: z.string()
}) satisfies z.ZodType<Visit>;

export type CreateVisitData = z.infer<typeof $CreateVisitData>;
export const $CreateVisitData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: $SubjectIdentificationData
});

