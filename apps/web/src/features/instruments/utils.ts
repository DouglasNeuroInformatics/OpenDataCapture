import type Types from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import i18n from '@/services/i18n';

import type { SelectedLanguage } from './types';

type BilingualFormData = {
  [key: string]: Types.ArrayFieldValue | Types.PrimitiveFieldValue;
  language: SelectedLanguage;
};

type CreateBilingualFieldOptions = {
  defaultLanguage: 'english' | 'french';
  label: string;
};

export const bilingualFieldSchema = z.array(
  z.object({
    english: z.string().optional(),
    french: z.string().optional()
  })
);

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

export function createBilingualField({
  defaultLanguage,
  label
}: CreateBilingualFieldOptions): Types.DynamicFormField<BilingualFormData> {
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
