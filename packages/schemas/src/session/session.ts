import { z } from 'zod/v4';

import { $BaseModel } from '../core/core.js';
import { $CreateSubjectData, $Subject } from '../subject/subject.js';

export type SessionType = z.infer<typeof $SessionType>;
export const $SessionType = z.enum(['RETROSPECTIVE', 'IN_PERSON', 'REMOTE']);

export type Session = z.infer<typeof $Session>;
export const $Session = $BaseModel.extend({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subject: $Subject.optional(),
  subjectId: z.string(),
  type: $SessionType,
  userId: z.string().nullish()
});

export type CreateSessionData = z.infer<typeof $CreateSessionData>;
export const $CreateSessionData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectData: $CreateSubjectData,
  type: $SessionType,
  username: z.string().nullish()
});
