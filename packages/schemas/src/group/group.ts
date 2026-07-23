import { z } from 'zod/v4';

import { $BaseModel, $RegexString } from '../core/core.js';
import { $LocalizedString } from '../mail/mail.js';
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
    .nullish(),
  minimumAge: z.number().int().positive().nullish(),
  subjectIdDisplayLength: z.number().nullish()
});

export type GroupType = z.infer<typeof $GroupType>;
export const $GroupType = z.enum(['CLINICAL', 'RESEARCH']);

/**
 * How a group email template is used:
 * - `REMOTE_ASSIGNMENT` — the email sent with a remote assignment link (supports
 *   `{{url}}` and `{{expiresAt}}` placeholders); the active one is used automatically.
 * - `INFORMATION` — a general study-related message a group manager sends to participants.
 */
export type GroupEmailTemplateCategory = z.infer<typeof $GroupEmailTemplateCategory>;
export const $GroupEmailTemplateCategory = z.enum(['REMOTE_ASSIGNMENT', 'INFORMATION']);

/** A named, categorized email template authored by a group manager for its participants. */
export type GroupEmailTemplate = z.infer<typeof $GroupEmailTemplate>;
export const $GroupEmailTemplate = z.object({
  body: $LocalizedString.nullish(),
  category: $GroupEmailTemplateCategory,
  id: z.string().min(1),
  name: z.string().min(1),
  subject: $LocalizedString.nullish()
});

export type Group = z.infer<typeof $Group>;
export const $Group = $BaseModel.extend({
  accessibleInstrumentIds: z.array(z.string()),
  /** The id of the active `REMOTE_ASSIGNMENT` template within `emailTemplates`, if any */
  activeAssignmentEmailTemplateId: z.string().nullish(),
  /** The id of the active `INFORMATION` template within `emailTemplates`, if any */
  activeInformationTemplateId: z.string().nullish(),
  /** Group-manager-authored email templates for this group's participants */
  emailTemplates: z.array($GroupEmailTemplate).optional(),
  instrumentRepoIds: z.array(z.string()),
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
