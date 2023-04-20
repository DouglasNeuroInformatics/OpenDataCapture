import {
  FormFields,
  FormInstrument,
  FormInstrumentContent,
  FormInstrumentData,
  Language,
  MultilingualForm,
  MultilingualFormFields
} from '@douglasneuroinformatics/common';

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
    const { label, description, ...rest } = multilingualFields[fieldName];
    fields[fieldName] = { label: label[language], description: description?.[language], ...rest };
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
        fields: getTranslatedFields(group.fields as MultilingualFormFields<T>, language)
      }));
    } else {
      content = getTranslatedFields(multilingualForm.content, language);
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
      validationSchema: multilingualForm.validationSchema
    };
  }
  return forms as TranslatedForms<T>;
}

export { createTranslatedForms, type TranslatedForms };
