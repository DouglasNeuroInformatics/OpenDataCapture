import { z } from 'zod';

import { $BaseModel } from '../core/core.js';
import { $CreateSubjectData, $Subject } from '../subject/subject.js';

export type SessionType = z.infer<typeof $SessionType>;
export const $SessionType = z.enum(['RETROSPECTIVE', 'IN_PERSON', 'REMOTE']);

export type Session = z.infer<typeof $Session>;
export const $Session = $BaseModel.extend({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subject: $Subject,
  subjectId: z.string(),
  type: $SessionType
});

export type CreateSessionData = z.infer<typeof $CreateSessionData>;
export const $CreateSessionData = z.object({
  date: z.coerce.date(),
  groupId: z.string().nullable(),
  subjectData: $CreateSubjectData,
  type: $SessionType
});
