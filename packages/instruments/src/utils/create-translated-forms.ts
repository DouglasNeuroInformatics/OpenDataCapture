/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { FormFields, FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { FormInstrument, Language, Measures, MultilingualForm, MultilingualFormFields } from '@open-data-capture/types';

type TranslatedForms<T extends FormInstrumentData> = {
  [L in Language]: FormInstrument<T>;
};

/** Return the fields for the provided language */
function getTranslatedFields<T extends FormInstrumentData>(
  multilingualFields: MultilingualFormFields<T>,
  language: Language
) {
  const fields: { [K in keyof T]?: any } = {};
  for (const fieldName in multilingualFields) {
    const { label, description, options, ...rest } = multilingualFields[fieldName] as any;
    fields[fieldName] = {
      label: label[language],
      description: description?.[language],
      options: options?.[language],
      ...rest
    };
  }
  return fields as FormFields<T>;
}

/**
 * Given a multilingual form, returns an object with the keys `en` and `fr`
 * mapped to the English and French versions of the form instrument respectively.
 */
function createTranslatedForms<T extends FormInstrumentData>(
  multilingualForm: MultilingualForm<T>
): TranslatedForms<T> {
  const forms: Partial<TranslatedForms<T>> = {};
  for (const language of ['en', 'fr'] satisfies Language[]) {
    let content: FormInstrumentContent<T>;
    if (multilingualForm.content instanceof Array) {
      content = multilingualForm.content.map((group) => ({
        title: group.title[language],
        description: group.description?.[language],
        fields: getTranslatedFields(group.fields as MultilingualFormFields<T>, language)
      }));
    } else {
      content = getTranslatedFields(multilingualForm.content, language);
    }

    let measures: Measures<T> | undefined;
    if (multilingualForm.measures) {
      measures = {};
      for (const key in multilingualForm.measures) {
        const measure = multilingualForm.measures[key];
        measures[key] = {
          formula: measure!.formula,
          label: measure!.label[language]
        };
      }
    }

    forms[language] = {
      kind: 'form',
      name: multilingualForm.name,
      tags: multilingualForm.tags,
      version: multilingualForm.version,
      details: {
        language,
        estimatedDuration: multilingualForm.details.estimatedDuration,
        description: multilingualForm.details.description[language],
        instructions: multilingualForm.details.instructions[language],
        title: multilingualForm.details.title[language]
      },
      content,
      measures,
      validationSchema: multilingualForm.validationSchema
    };
  }
  return forms as TranslatedForms<T>;
}

export { createTranslatedForms, type TranslatedForms };
