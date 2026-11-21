import { z } from 'zod/v4';

import { $AuthoredLocalizedString, $LocalizedString } from '../core/core.js';
import { $SubjectIdentificationMethod } from '../subject/subject.js';

import type { SubjectIdentificationMethod } from '../subject/subject.js';

// ── Internal helpers (must precede all exports for import/exports-last) ───────

const CUSTOM_FIELDS_MAX_FIELD_COUNT = 10;

const CUSTOM_FIELD_MAX_VALUE_LENGTH = 200;

/**
 * A field's pattern must accept the whole normalized value, never a part of it, and is read with
 * the `u` flag so a class like `\p{L}` means what it says. Saving a pattern compiles it this same
 * way, so a pattern that is stored is one this can compile.
 */
function compileCustomFieldPattern(pattern: string): RegExp {
  return new RegExp(`^(?:${pattern})$`, 'u');
}

function isCompilableCustomFieldPattern(pattern: string) {
  try {
    compileCustomFieldPattern(pattern);
    return true;
  } catch {
    return false;
  }
}

const $CustomIdentificationField = z.object({
  description: $LocalizedString.nullish(),
  label: $AuthoredLocalizedString,
  pattern: z.string().min(1).refine(isCompilableCustomFieldPattern, 'Must be a valid regular expression'),
  patternErrorMessage: $LocalizedString.nullish()
});

// Every field is required, so a subject has exactly one id; an optional field would give it two.
const $CustomFieldsDefinitionData = z.object({
  fields: z.array($CustomIdentificationField).min(1).max(CUSTOM_FIELDS_MAX_FIELD_COUNT),
  label: $AuthoredLocalizedString
});

// The server adds the salt and the iteration count when a definition is first saved; no client
// supplies either.
const $CustomFieldsDefinition = $CustomFieldsDefinitionData.extend({
  iterations: z.number().int().positive(),
  salt: z.string()
});

// A tuple, so the type carries what the schema checks: a form can always fall back to the first.
const $OfferedSubjectIdentificationMethods = z
  .tuple([$SubjectIdentificationMethod], $SubjectIdentificationMethod)
  .refine((methods) => new Set(methods).size === methods.length, 'Each method may be offered only once');

/** What an instance offers until an administrator chooses otherwise. */
const DEFAULT_OFFERED_SUBJECT_IDENTIFICATION_METHODS: z.infer<typeof $OfferedSubjectIdentificationMethods> = [
  'CUSTOM_ID',
  'PERSONAL_INFO'
];

const $SubjectIdentificationSettings = z.object({
  customFields: $CustomFieldsDefinition.nullable(),
  /** Once a subject has an id derived from the fields, their number and order can never change. */
  isCustomFieldsLocked: z.boolean(),
  offeredMethods: $OfferedSubjectIdentificationMethods
});

const $UpdateSubjectIdentificationSettingsData = z
  .object({
    customFields: $CustomFieldsDefinitionData.nullable(),
    offeredMethods: $OfferedSubjectIdentificationMethods
  })
  .check((ctx) => {
    if (ctx.value.offeredMethods.includes('CUSTOM_FIELDS') && !ctx.value.customFields) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.offeredMethods,
        message: 'Custom fields can be offered only once they are defined',
        path: ['offeredMethods']
      });
    }
  });

/** How many subjects are identified by each method, told apart by the shape of their ids. */
const $SubjectIdentificationCounts = z.object({
  CUSTOM_FIELDS: z.number().int().nonnegative(),
  CUSTOM_ID: z.number().int().nonnegative(),
  PERSONAL_INFO: z.number().int().nonnegative()
} satisfies { [K in SubjectIdentificationMethod]: z.ZodType<number> });

type CustomIdentificationField = z.infer<typeof $CustomIdentificationField>;

type CustomFieldsDefinitionData = z.infer<typeof $CustomFieldsDefinitionData>;

type CustomFieldsDefinition = z.infer<typeof $CustomFieldsDefinition>;

type SubjectIdentificationSettings = z.infer<typeof $SubjectIdentificationSettings>;

type SubjectIdentificationCounts = z.infer<typeof $SubjectIdentificationCounts>;

type OfferedSubjectIdentificationMethods = z.infer<typeof $OfferedSubjectIdentificationMethods>;

type $UpdateSubjectIdentificationSettingsData = z.infer<typeof $UpdateSubjectIdentificationSettingsData>;

export {
  $CustomFieldsDefinition,
  $CustomFieldsDefinitionData,
  $CustomIdentificationField,
  $SubjectIdentificationCounts,
  $SubjectIdentificationSettings,
  $UpdateSubjectIdentificationSettingsData,
  compileCustomFieldPattern,
  CUSTOM_FIELD_MAX_VALUE_LENGTH,
  CUSTOM_FIELDS_MAX_FIELD_COUNT,
  DEFAULT_OFFERED_SUBJECT_IDENTIFICATION_METHODS
};

export type {
  CustomFieldsDefinition,
  CustomFieldsDefinitionData,
  CustomIdentificationField,
  OfferedSubjectIdentificationMethods,
  SubjectIdentificationCounts,
  SubjectIdentificationSettings
};
