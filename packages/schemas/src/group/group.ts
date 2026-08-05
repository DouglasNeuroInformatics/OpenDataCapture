import { z } from 'zod/v4';

import { $AuthoredLocalizedString, $BaseModel, $LocalizedString, $RegexString } from '../core/core.js';
import { $SubjectIdentificationMethod } from '../subject/subject.js';

export type GroupSettings = z.infer<typeof $GroupSettings>;
export const $GroupSettings = z.object({
  defaultIdentificationMethod: $SubjectIdentificationMethod,
  idValidationRegex: $RegexString.nullish(),
  idValidationRegexErrorMessage: $LocalizedString.nullish(),
  minimumAge: z.number().int().positive().nullish(),
  subjectIdDisplayLength: z.number().nullish()
});

export type GroupType = z.infer<typeof $GroupType>;
export const $GroupType = z.enum(['CLINICAL', 'RESEARCH']);

/**
 * A named remote-assignment email template authored by a group manager. Bodies support the
 * `{{url}}` and `{{expiresAt}}` placeholders. Subject and body must each carry content in at
 * least one language: a stored template with neither would otherwise reach a participant as an
 * empty subject over a bare link, reported as sent.
 */
export type GroupEmailTemplate = z.infer<typeof $GroupEmailTemplate>;
export const $GroupEmailTemplate = z.object({
  body: $AuthoredLocalizedString,
  id: z.string().min(1),
  name: z.string().min(1),
  subject: $AuthoredLocalizedString
});

export type Group = z.infer<typeof $Group>;
export const $Group = $BaseModel.extend({
  accessibleInstrumentIds: z.array(z.string()),
  /** The id of the template within `emailTemplates` sent by default with a remote assignment, if any */
  activeAssignmentEmailTemplateId: z.string().nullish(),
  /** Group-manager-authored remote-assignment email templates for this group's participants */
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
  .partial()
  .extend({
    /**
     * The `updatedAt` of the group revision this update was composed against. The server rejects
     * the write when the group has moved on since.
     */
    expectedUpdatedAt: z.coerce.date().optional()
  })
  .check((ctx) => {
    // `emailTemplates` is replaced wholesale from the client's cached copy, so without a revision
    // to check against, two managers editing concurrently would each silently discard the other's.
    if (ctx.value.emailTemplates && !ctx.value.expectedUpdatedAt) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.expectedUpdatedAt,
        message: 'expectedUpdatedAt is required when updating emailTemplates',
        path: ['expectedUpdatedAt']
      });
    }
  });
