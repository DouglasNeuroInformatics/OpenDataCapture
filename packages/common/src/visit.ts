import type { VisitModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';
import { $Subject, $SubjectIdentificationData, type Subject } from './subject';

export type Visit = VisitModel & {
  subject: Subject;
};
export const $Visit = $BaseModel.extend({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subject: $Subject,
  subjectId: z.string()
}) satisfies z.ZodType<Visit>;

export type CreateVisitData = z.infer<typeof $CreateVisitData>;
export const $CreateVisitData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: $SubjectIdentificationData
});
