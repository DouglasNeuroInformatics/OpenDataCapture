import { FormDetails, FormFields, FormInstrumentData, Language } from '@ddcp/common';
import { JSONSchemaType } from 'ajv';

type MultilingualFormDetails = Pick<FormDetails, 'estimatedDuration'> & {
  [K in keyof Pick<FormDetails, 'description' | 'instructions' | 'title'>]: {
    [L in Language]: FormDetails[K];
  };
};

type MultilingualItem<T> = {
  [L in Language]: T;
};

type MultilingualFormField<T> = T extends any
  ? Omit<T, 'label' | 'description'> & {
      description?: MultilingualItem<string>;
      label: MultilingualItem<string>;
    }
  : never;

type MultilingualFormContent<TData extends FormInstrumentData> = {
  [K in keyof FormFields<TData>]: MultilingualFormField<FormFields<TData>[K]>;
};

export type MultilingualForm<TData extends FormInstrumentData> = {
  name: string;
  tags: string[];
  version: number;
  details: MultilingualFormDetails;
  content: MultilingualFormContent<TData>;
  validationSchema: JSONSchemaType<TData>;
};

/*
function getFormContent<TData extends FormInstrumentData>(multilingualContent: MultilingualFormContent<TData>) {
  const content: Partial<FormFields<TData>> = {};
  for (const fieldName in multilingualContent) {
    const { description, label, ...rest } = multilingualContent[fieldName];
    content[fieldName] = { label: label.en, description: description?.en, ...rest };
  }
}

export function createMultilingualForm<TData extends FormInstrumentData>(
  form: MultilingualForm<TData>
): FormInstrument<TData>[] {
  const languages: Language[] = ['en', 'fr'];
  return languages.map((language) => {
    const content = Object.fromEntries(
      Object.entries(form.content).map(([key, value]) => [key, value])
    ) as FormFields<TData>;

    for (const fieldName in form.content) {
      content[fieldName] = { ...form.content[fieldName], label: 'string' };
    }
    Object.keys(form.content).map((fieldName) => {
      content[fieldName] = { ...form.content[fieldName], label: 'string' };
    });
    return {
      kind: 'form',
      name: form.name,
      tags: form.tags,
      version: form.version,
      details: {
        language,
        estimatedDuration: form.details.estimatedDuration,
        description: form.details.description[language],
        instructions: form.details.instructions[language],
        title: form.details.title[language]
      },
      content: getFormContent(form.content, language),
      validationSchema: form.validationSchema
    };
  });
}
*/
