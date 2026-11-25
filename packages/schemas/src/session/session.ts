import { z } from 'zod/v4';

import { $BaseModel, $DateLike, $Json } from '../core/core.js';
import { $CreateSubjectData, $Subject } from '../subject/subject.js';

export type SessionType = z.infer<typeof $SessionType>;
export const $SessionType = z.enum(['RETROSPECTIVE', 'IN_PERSON', 'REMOTE']);

export type Session = z.infer<typeof $Session>;
export const $Session = $BaseModel.extend({
  date: $DateLike,
  groupId: z.string().nullable(),
  subject: $Subject.nullable(),
  subjectId: z.string(),
  type: $SessionType,
  userId: z.string().nullish()
});

export type $CreateSessionData = z.infer<typeof $CreateSessionData>;
export const $CreateSessionData = z.object({
  date: $DateLike,
  groupId: z.string().nullable(),
  subjectData: $CreateSubjectData,
  type: $SessionType,
  username: z.string().nullish()
});

export type $StartSessionData = z.infer<typeof $StartSessionData>;
export const $StartSessionData = $CreateSessionData.extend({
  // Required exactly when the session's group has a session instrument.
  sessionInstrumentAnswers: z.object({ data: $Json, instrumentId: z.string() }).optional()
});

export type SessionWithUser = Session & {
  user: null | {
    username?: null | string;
  };
};
