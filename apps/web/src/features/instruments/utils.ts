/* eslint-disable perfectionist/sort-objects */

import type Types from '@douglasneuroinformatics/form-types';
import type { FormFieldsGroup } from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import i18n from '@/services/i18n';

import type { SelectedLanguage } from './types';

type BilingualFormData = {
  [key: string]: Types.ArrayFieldValue | Types.PrimitiveFieldValue;
  language: SelectedLanguage;
};

export const bilingualArrayFieldSchema = z.array(
  z.object({
    english: z.string().optional(),
    french: z.string().optional()
  })
);

export function createBilingualArrayField({
  defaultLanguage,
  label
}: {
  defaultLanguage: 'english' | 'french';
  label: string;
}): Types.DynamicFormField<BilingualFormData> {
  const fieldsetOptions = {
    english: {
      kind: 'text',
      label: i18n.t('common:languages.english'),
      variant: 'short'
    },
    french: {
      kind: 'text',
      label: i18n.t('common:languages.french'),
      variant: 'short'
    }
  } as const;

  return {
    deps: ['language'],
    kind: 'dynamic',
    render: (data) => {
      const field: Types.ArrayFormField = {
        fieldset: {},
        kind: 'array',
        label
      };
      if (!data?.language) {
        field.fieldset[defaultLanguage] = fieldsetOptions[defaultLanguage];
      }
      if (data?.language === 'english' || data?.language === 'bilingual') {
        field.fieldset.english = fieldsetOptions.english;
      }
      if (data?.language === 'french' || data?.language === 'bilingual') {
        field.fieldset.french = fieldsetOptions.french;
      }
      return field;
    }
  };
}

export function createBilingualFieldGroup({
  baseFieldName,
  defaultLanguage,
  label
}: {
  baseFieldName: string;
  defaultLanguage: 'english' | 'french';
  label: string;
}): FormFieldsGroup {
  return {
    title: label,
    fields: {
      [`${baseFieldName}English`]: {
        deps: ['language'],
        kind: 'dynamic',
        render: (data) => {
          return (!data && defaultLanguage === 'english') ||
            data?.language === 'english' ||
            data?.language === 'bilingual'
            ? {
                kind: 'text',
                label: i18n.t('common:languages.english'),
                variant: 'short'
              }
            : null;
        }
      },
      [`${baseFieldName}French`]: {
        deps: ['language'],
        kind: 'dynamic',
        render: (data) => {
          return (!data && defaultLanguage === 'french') ||
            data?.language === 'french' ||
            data?.language === 'bilingual'
            ? {
                kind: 'text',
                label: i18n.t('common:languages.french'),
                variant: 'short'
              }
            : null;
        }
      }
    }
  };
}
