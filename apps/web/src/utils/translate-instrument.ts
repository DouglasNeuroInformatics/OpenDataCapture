import type Base from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import { mapValues, merge } from 'lodash';

function isUnilingualFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Types.Language
): summary is Types.FormInstrumentSummary<TData, Types.Language> {
  return summary.language === language;
}

function isMultilingualFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Types.Language
): summary is Types.FormInstrumentSummary<TData, Types.Language[]> {
  return Array.isArray(summary.language) && summary.language.includes(language);
}

/** Return whether the instrument is a unilingual form in the provided language */
function isUnilingualForm<TData extends Base.FormDataType>(
  instrument: Types.FormInstrument<TData>,
  language: Types.Language
): instrument is Types.UnilingualFormInstrument<TData> {
  return isUnilingualFormSummary(instrument, language);
}

/** Return whether the instrument is a multilingual form, with the provided language as an option */
function isMultilingualForm<TData extends Base.FormDataType>(
  instrument: Types.FormInstrument<TData>,
  language: Types.Language
): instrument is Types.MultilingualFormInstrument<TData> {
  return isMultilingualFormSummary(instrument, language);
}

function isDynamicFormField<TData extends Base.FormDataType>(
  field: Types.FormInstrumentUnknownField<Types.Language[], TData>
): field is Types.FormInstrumentDynamicField<Types.Language[], TData> {
  return typeof field === 'function';
}

function translatePrimitiveField(
  field: Types.FormInstrumentPrimitiveField<Types.Language[]>,
  language: Types.Language
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
  fieldset: Types.FormInstrumentArrayFieldset<Types.Language[]>,
  language: Types.Language
): Base.ArrayFieldset<Base.ArrayFieldValue[number]> {
  const transformedFieldset: Types.FormInstrumentArrayFieldset<Types.Language> = {};
  for (const key in fieldset) {
    const field = fieldset[key]!;
    if (typeof field === 'function') {
      transformedFieldset[key] = (fieldset: Record<string, Base.PrimitiveFieldValue | null | undefined>) => {
        const result: Types.FormInstrumentPrimitiveField<Types.Language[]> | null = field(fieldset);
        if (result === null) {
          return null;
        }
        return translatePrimitiveField(result, language);
      };
    } else {
      transformedFieldset[key] = translatePrimitiveField(field, language);
    }
  }
  return transformedFieldset;
}

function translateStaticField(
  field: Types.FormInstrumentStaticField<Types.Language[]>,
  language: Types.Language
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
  fields: Types.FormInstrumentFields<Types.Language[]>,
  language: Types.Language
): Base.FormFields {
  return mapValues(fields, (field) => {
    if (isDynamicFormField(field)) {
      return (data: Base.NullableFormDataType | null) => {
        const result = field(data);
        if (result === null) {
          return null;
        }
        return translateStaticField(result, language);
      };
    }
    return translateStaticField(field, language);
  });
}

function translateFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary<TData>,
  language: Types.Language
): Types.FormInstrumentSummary<TData, Types.Language> | null {
  if (isUnilingualFormSummary(summary, language)) {
    return summary;
  } else if (isMultilingualFormSummary(summary, language)) {
    summary.details.description;
    return merge(summary, {
      details: {
        description: summary.details.description[language],
        instructions: summary.details.instructions[language],
        title: summary.details.title[language]
      },
      language: language,
      tags: summary.tags[language]
    });
  }
  return null;
}

function translateFormInstrument<TData extends Base.FormDataType>(
  form: Types.FormInstrument<TData>,
  language: Types.Language
): Types.UnilingualFormInstrument<TData> | null {
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
        instructions: form.details.instructions[language],
        title: form.details.title[language]
      },
      language: language,
      measures: mapValues(form.measures, (measure) => ({ label: measure.label[language], value: measure.value })),
      tags: form.tags[language]
    }) as Types.UnilingualFormInstrument<TData>;
  }
  return null;
}

export function resolveFormInstrument<TData extends Base.FormDataType>(
  form: Types.FormInstrument<TData>,
  preferredLanguage: Types.Language
) {
  const altLanguage = preferredLanguage === 'en' ? 'fr' : 'en';
  return (translateFormInstrument(form, preferredLanguage) ?? translateFormInstrument(form, altLanguage))!;
}

export function resolveFormSummary<TData extends Base.FormDataType>(
  summary: Types.FormInstrumentSummary,
  preferredLanguage: Types.Language
): Types.FormInstrumentSummary<TData, Types.Language> {
  const altLanguage = preferredLanguage === 'en' ? 'fr' : 'en';
  return (translateFormSummary(summary, preferredLanguage) ?? translateFormSummary(summary, altLanguage))!;
}
