import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { LocalizedString } from '@opendatacapture/schemas/core';
import {
  compileCustomFieldPattern,
  CUSTOM_FIELD_MAX_VALUE_LENGTH
} from '@opendatacapture/schemas/subject-identification';
import type { CustomFieldsDefinition } from '@opendatacapture/schemas/subject-identification';
import { deriveCustomFieldsSubjectId, normalizeCustomFieldValue } from '@opendatacapture/subject-utils';
import { z } from 'zod/v4';

import { getValueForLanguage } from '@/utils/language';

const customFieldKey = (index: number): CustomFieldKey => `customField${index}`;

export type CustomFieldKey = `customField${number}`;

/** The part of an identification form the custom fields read: their values and the method chosen. */
export type CustomFieldsFormData = { [K in CustomFieldKey]?: string } & { subjectIdentificationMethod: string };

export type CustomFieldErrors = { [K in CustomFieldKey]?: string };

/**
 * The fields an administrator defined for identifying subjects, ready to drop into a libui `Form`
 * whose `subjectIdentificationMethod` can be `CUSTOM_FIELDS`. Every field is required, and each is
 * judged on its normalized value, which is what the id is derived from.
 */
export function useCustomIdentificationFields(definition: CustomFieldsDefinition | null) {
  const { resolvedLanguage, t } = useTranslation();
  const fields = definition?.fields ?? [];

  const localize = (value: LocalizedString | null | undefined) => {
    return value ? getValueForLanguage(value, resolvedLanguage) : undefined;
  };

  const formFields: { [K in CustomFieldKey]?: FormTypes.DynamicField<CustomFieldsFormData> } = Object.fromEntries(
    fields.map((field, index) => [
      customFieldKey(index),
      {
        deps: ['subjectIdentificationMethod'],
        kind: 'dynamic',
        render: ({ subjectIdentificationMethod }) => {
          return subjectIdentificationMethod === 'CUSTOM_FIELDS'
            ? {
                description: localize(field.description),
                kind: 'string',
                label: localize(field.label) ?? '',
                variant: 'input'
              }
            : null;
        }
      } satisfies FormTypes.DynamicField<CustomFieldsFormData>
    ])
  );

  // Every check lives in `findErrors`, run from the form's refinement: zod v4 drops a property that
  // failed its own checks from the value it hands a refinement.
  const shape: { [K in CustomFieldKey]: z.ZodOptional<z.ZodString> } = Object.fromEntries(
    fields.map((_, index) => [customFieldKey(index), z.string().optional()])
  );

  const findErrors = (values: { [K in CustomFieldKey]?: string }): CustomFieldErrors => {
    const errors: CustomFieldErrors = {};
    fields.forEach((field, index) => {
      const key = customFieldKey(index);
      const value = values[key];
      if (!value) {
        errors[key] = t('core.form.requiredField');
      } else if (value.length > CUSTOM_FIELD_MAX_VALUE_LENGTH) {
        errors[key] = t({
          en: `Must be at most ${CUSTOM_FIELD_MAX_VALUE_LENGTH} characters`,
          es: `Debe tener como máximo ${CUSTOM_FIELD_MAX_VALUE_LENGTH} caracteres`,
          fr: `Doit comporter au plus ${CUSTOM_FIELD_MAX_VALUE_LENGTH} caractères`
        });
      } else if (!normalizeCustomFieldValue(value)) {
        errors[key] = t({
          en: 'Must contain at least one letter or digit',
          es: 'Debe contener al menos una letra o un dígito',
          fr: 'Doit contenir au moins une lettre ou un chiffre'
        });
      } else if (!compileCustomFieldPattern(field.pattern).test(normalizeCustomFieldValue(value))) {
        errors[key] =
          localize(field.patternErrorMessage) ??
          t({
            en: `Must match regular expression: ${field.pattern}`,
            es: `Debe coincidir con la expresión regular: ${field.pattern}`,
            fr: `Doit correspondre à l'expression régulière : ${field.pattern}`
          });
      }
    });
    return errors;
  };

  const orderValues = (values: { [K in CustomFieldKey]?: string }) => {
    return fields.map((_, index) => values[customFieldKey(index)] ?? '');
  };

  return {
    /** Rejects without a definition, which a form offering the method always has. */
    deriveSubjectId: async (values: { [K in CustomFieldKey]?: string }) => {
      if (!definition) {
        throw new Error('Cannot derive a subject id without a definition of the custom fields');
      }
      return deriveCustomFieldsSubjectId(orderValues(values), {
        iterations: definition.iterations,
        salt: definition.salt
      });
    },
    findErrors,
    formFields,
    label: definition ? (localize(definition.label) ?? '') : null,
    orderValues,
    shape
  };
}
