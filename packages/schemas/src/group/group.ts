import { z } from 'zod';

import { $BaseModel, $RegexString } from '../core/core.js';
import { $SubjectIdentificationMethod } from '../subject/subject.js';

export type GroupSettings = z.infer<typeof $GroupSettings>;
export const $GroupSettings = z.object({
  defaultIdentificationMethod: $SubjectIdentificationMethod,
  idValidationRegex: $RegexString.nullish(),
  idValidationRegexErrorMessage: z
    .object({
      en: z.string().nullish(),
      fr: z.string().nullish()
    })
    .nullish()
});

export type GroupType = z.infer<typeof $GroupType>;
export const $GroupType = z.enum(['CLINICAL', 'RESEARCH']);

export type Group = z.infer<typeof $Group>;
export const $Group = $BaseModel.extend({
  accessibleInstrumentIds: z.array(z.string()),
  name: z.string().min(1),
  settings: $GroupSettings,
  subjectIds: z.array(z.string()),
  type: $GroupType,
  userIds: z.array(z.string())
});

export type CreateGroupData = z.infer<typeof $CreateGroupData>;
export const $CreateGroupData = z.object({
  name: z.string().min(1),
  settings: $GroupSettings.optional(),
  type: $GroupType
});

export type UpdateGroupData = z.infer<typeof $UpdateGroupData>;
export const $UpdateGroupData = $Group
  .omit({
    subjectIds: true,
    userIds: true
  })
  .extend({
    settings: $GroupSettings.partial()
  })
  .partial();
