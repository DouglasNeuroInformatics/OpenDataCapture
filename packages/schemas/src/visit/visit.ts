import { z } from 'zod';

import { $BaseModel } from '../core/core.js';
import { $Subject, $SubjectIdentificationData } from '../subject/subject.js';

export type Visit = z.infer<typeof $Visit>;
export const $Visit = $BaseModel.extend({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subject: $Subject,
  subjectId: z.string()
});

export type CreateVisitData = z.infer<typeof $CreateVisitData>;
export const $CreateVisitData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectIdData: $SubjectIdentificationData
});
