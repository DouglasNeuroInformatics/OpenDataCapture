import type Base from '@douglasneuroinformatics/form-types';
import type { Language } from '@open-data-capture/common/core';
import type * as Types from '@open-data-capture/common/instrument';
import { mapValues, merge } from 'lodash';

function isUnilingualFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Language
): summary is Types.FormInstrumentSummary<TData, Language> {
  return summary.language === language;
}

function isMultilingualFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Language
): summary is Types.FormInstrumentSummary<TData, Language[]> {
  return Array.isArray(summary.language) && summary.language.includes(language);
}

/** Return whether the instrument is a unilingual form in the provided language */
function isUnilingualForm<TData extends Base.FormDataType>(
  instrument: Types.FormInstrument<TData>,
  language: Language
): instrument is Types.FormInstrument<TData, Language> {
  return isUnilingualFormSummary(instrument, language);
}

/** Return whether the instrument is a multilingual form, with the provided language as an option */
function isMultilingualForm<TData extends Base.FormDataType>(
  instrument: Types.FormInstrument<TData>,
  language: Language
): instrument is Types.FormInstrument<TData, Language[]> {
  return isMultilingualFormSummary(instrument, language);
}

function translatePrimitiveField(
  field: Types.FormInstrumentPrimitiveField<Language[]>,
  language: Language
): Base.PrimitiveFormField {
  const base = {
    description: field.description?.[language],
    label: field.label[language]
  };
  switch (field.kind) {
    case 'binary':
      switch (field.variant) {
        case 'checkbox':
          return { ...field, ...base };
        case 'radio':
          return { ...field, ...base, options: field.options?.[language] };
        default:
          throw new Error(`Unexpected property 'variant' for field: ${JSON.stringify(field, null, 2)}`);
      }
    case 'date':
      return { ...field, ...base };
    case 'numeric':
      return { ...field, ...base };
    case 'options':
      return { ...field, ...base, options: field.options[language] };
    case 'text':
      return { ...field, ...base };
    default:
      throw new Error(`Unexpected property 'kind' for field: ${JSON.stringify(field, null, 2)}`);
  }
}

function translateArrayFieldset(
  fieldset: Types.FormInstrumentArrayFieldset<Language[]>,
  language: Language
): Base.ArrayFieldset<Base.ArrayFieldValue[number]> {
  const transformedFieldset: Types.FormInstrumentArrayFieldset<Language> = {};
  for (const key in fieldset) {
    const field = fieldset[key]!;
    if (field.kind === 'dynamic-fieldset') {
      transformedFieldset[key] = {
        kind: 'dynamic-fieldset',
        render: (fieldset: Record<string, Base.PrimitiveFieldValue | null | undefined>) => {
          const result: Types.FormInstrumentPrimitiveField<Language[]> | null = field.render(fieldset);
          if (result === null) {
            return null;
          }
          return translatePrimitiveField(result, language);
        }
      };
    } else {
      transformedFieldset[key] = translatePrimitiveField(field, language);
    }
  }
  return transformedFieldset;
}

function translateStaticField(
  field: Types.FormInstrumentStaticField<Language[]>,
  language: Language
): Base.StaticFormField<Base.ArrayFieldValue | Base.PrimitiveFieldValue> {
  if (field.kind === 'array') {
    return {
      ...field,
      description: field.description?.[language],
      fieldset: translateArrayFieldset(field.fieldset, language),
      label: field.label[language]
    };
  } else {
    return translatePrimitiveField(field, language);
  }
}

function translateFormFields(
  fields: Types.FormInstrumentFields<Base.FormDataType, Language[]>,
  language: Language
): Base.FormFields {
  const translatedFields: Base.FormFields = {};
  for (const fieldName in fields) {
    const field = fields[fieldName]!;
    if (field.kind === 'dynamic') {
      translatedFields[fieldName] = {
        deps: field.deps,
        kind: 'dynamic',
        render: (data: Base.NullableFormDataType | null) => {
          const result = field.render(data);
          if (result === null) {
            return null;
          }
          return translateStaticField(result, language);
        }
      };
    } else {
      translatedFields[fieldName] = translateStaticField(field, language);
    }
  }
  return translatedFields;
}

function strictTranslateFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Language
): Types.FormInstrumentSummary<TData, Language> | null {
  if (isUnilingualFormSummary(summary, language)) {
    return summary;
  } else if (isMultilingualFormSummary(summary, language)) {
    return merge(summary, {
      details: {
        description: summary.details.description[language],
        title: summary.details.title[language]
      },
      language: language,
      measures: mapValues(summary.measures, (measure) => ({
        label: measure.label[language]
      })),
      tags: summary.tags[language]
    });
  }
  return null;
}

function strictTranslateFormInstrument<TData extends Base.FormDataType>(
  form: Types.FormInstrument<TData>,
  language: Language
): Types.FormInstrument<TData, Language> | null {
  if (isUnilingualForm(form, language)) {
    return form;
  } else if (isMultilingualForm(form, language)) {
    return merge(form, {
      content: Array.isArray(form.content)
        ? form.content.map((group) => ({
            description: group.description?.[language],
            fields: translateFormFields(group.fields as Types.FormInstrumentFields, language),
            title: group.title[language]
          }))
        : translateFormFields(form.content as Types.FormInstrumentFields, language),
      details: {
        description: form.details.description[language],
        estimatedDuration: form.details.estimatedDuration,
        instructions: form.details.instructions?.[language],
        title: form.details.title[language]
      },
      language: language,
      measures: mapValues(form.measures, (measure) => ({ label: measure.label[language], value: measure.value })),
      tags: form.tags[language]
    }) as Types.FormInstrument<TData, Language>;
  }
  return null;
}

export function translateFormInstrument<TData extends Base.FormDataType>(
  form: Types.FormInstrument<TData>,
  preferredLanguage: Language
) {
  const altLanguage = preferredLanguage === 'en' ? 'fr' : 'en';
  return (strictTranslateFormInstrument(form, preferredLanguage) ?? strictTranslateFormInstrument(form, altLanguage))!;
}

export function translateFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  preferredLanguage: Language
): Types.FormInstrumentSummary<TData, Language> {
  const altLanguage = preferredLanguage === 'en' ? 'fr' : 'en';
  return (strictTranslateFormSummary(summary, preferredLanguage) ?? strictTranslateFormSummary(summary, altLanguage))!;
}
