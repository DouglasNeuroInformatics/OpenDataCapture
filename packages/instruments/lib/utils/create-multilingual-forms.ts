import { Language } from '@ddcp/common/core';
import { FormFields, FormInstrument, FormInstrumentData } from '@ddcp/common/instruments';

import { MultilingualFormDefinition, MultilingualFormFields } from '../types';

function getFormFields<TData extends FormInstrumentData>(
  multilingualFields: MultilingualFormFields<TData>,
  language: Language
): FormFields<TData> {
  const fields: { [K in keyof TData]?: any } = {};
  for (const fieldName in multilingualFields) {
    const { label, ...rest } = multilingualFields[fieldName];
    fields[fieldName] = { label: label[language], ...rest };
  }
  return fields as FormFields<TData>;
}

export type MultilingualForms<TData extends FormInstrumentData> = {
  [L in Language]?: FormInstrument<TData>;
};

export function createMultilingualForms<TData extends FormInstrumentData>({
  name,
  tags,
  version,
  details,
  content,
  validationSchema
}: MultilingualFormDefinition<TData>): MultilingualForms<TData> {
  const forms: Partial<MultilingualForms<TData>> = {};
  for (const language of ['en', 'fr'] satisfies Language[]) {
    forms[language] = {
      kind: 'form',
      name,
      tags,
      version,
      details: {
        language,
        estimatedDuration: details.estimatedDuration,
        description: details.description[language],
        instructions: details.instructions[language],
        title: details.title[language]
      },
      content: getFormFields(content, language),
      validationSchema
    };
  }
  return forms as MultilingualForms<TData>;
}
