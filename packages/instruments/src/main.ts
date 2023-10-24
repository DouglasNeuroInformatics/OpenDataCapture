import type Base from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import { mapValues, merge } from 'lodash';

import { happinessQuestionnaire } from '.';

/** Return whether the instrument is a unilingual form in the provided language */
function isUnilingualForm<TData extends Base.FormDataType, TLanguage extends Types.Language>(
  instrument: Types.FormInstrument<TData>,
  language: TLanguage
): instrument is Types.UnilingualFormInstrument<TData> {
  return instrument.language === language;
}

/** Return whether the instrument is a multilingual form, with the provided language as an option */
function isMultilingualForm<TData extends Base.FormDataType>(
  instrument: Types.FormInstrument<TData>,
  language: Types.Language
): instrument is Types.MultilingualFormInstrument<TData> {
  return Array.isArray(instrument.language) && instrument.language.includes(language);
}

function transformBaseField(
  field: Types.FormInstrumentFieldMixin<Types.Language[], Base.BaseFormField>,
  language: Types.Language
): Base.BaseFormField {
  return Object.assign(field, {
    description: field.description?.[language],
    label: field.label[language]
  });
}

function transformPrimitiveField(
  field: Types.FormInstrumentPrimitiveField<Types.Language[]>,
  language: Types.Language
): Base.PrimitiveFormField {
  const base = transformBaseField(field, language);
  if (field.kind === 'binary' && field.variant === 'checkbox') {
    return { ...base, kind: 'binary', variant: 'checkbox' } satisfies Extract<
      Base.BinaryFormField,
      { variant: 'checkbox' }
    >;
  } else if (field.kind === 'binary' && field.variant === 'radio') {
    return { ...base, kind: 'binary', options: field.options?.[language], variant: 'radio' } satisfies Extract<
      Base.BinaryFormField,
      { variant: 'radio' }
    >;
  } else if (field.kind === 'date') {
    return { ...base, kind: 'date' } satisfies Base.DateFormField;
  } else if (field.kind === 'numeric') {
    return {
      ...base,
      kind: 'numeric',
      max: field.max,
      min: field.min,
      variant: field.variant
    } satisfies Base.NumericFormField;
  } else if (field.kind === 'options') {
    return { ...base, kind: 'options', options: field.options[language] } satisfies Base.OptionsFormField;
  } else if (field.kind === 'text') {
    return { ...base, kind: 'text', variant: field.variant } satisfies Base.TextFormField;
  }
  throw new Error('Failed to match any of expected conditions');
}

function transformArrayFieldset(
  fieldset: Types.FormInstrumentArrayFieldset<Types.Language[]>,
  language: Types.Language
) {
  const transformedFieldset: Types.FormInstrumentArrayFieldset<Types.Language> = {};
  for (const key in fieldset) {
    const field = fieldset[key]!;
    if (typeof field === 'function') {
      transformedFieldset[key] = (fieldset: Record<string, Base.PrimitiveFieldValue | null | undefined>) => {
        const result: Types.FormInstrumentPrimitiveField<Types.Language[]> | null = field(fieldset);
        if (result === null) {
          return null;
        }
        return transformPrimitiveField(result, language);
      };
    } else {
      transformedFieldset[key] = transformPrimitiveField(field, language);
    }
  }
  return transformedFieldset;
}

function transformStaticField(
  field: Types.FormInstrumentStaticField<Types.Language[]>,
  language: Types.Language
): Types.FormInstrumentStaticField<Types.Language> {
  const base = transformBaseField(field, language);
  if (field.kind === 'array') {
    return {
      ...base,
      fieldset: transformArrayFieldset(field.fieldset, language),
      kind: 'array'
    } satisfies Base.ArrayFormField;
  } else {
    return transformPrimitiveField(field, language);
  }
}

function isDynamicFormField<TData extends Base.FormDataType>(
  field: Types.FormInstrumentUnknownField<Types.Language[], TData>
): field is Types.FormInstrumentDynamicField<Types.Language[], TData> {
  return typeof field === 'function';
}

function transformMultilingualFormFields(
  fields: Types.FormInstrumentFields<Types.Language[]>,
  language: Types.Language
): Types.FormInstrumentFields<Types.Language> {
  return mapValues(fields, (field) => {
    if (isDynamicFormField(field)) {
      return (data: Base.NullableFormDataType | null) => {
        const result = field(data);
        if (result === null) {
          return null;
        }
        return transformStaticField(result, language);
      };
    }
    return transformStaticField(field, language);
  });
}

function translateMultilingualForm(
  form: Types.MultilingualFormInstrument,
  language: Types.Language
): Types.UnilingualFormInstrument {
  return merge(form, {
    content: Array.isArray(form.content)
      ? form.content.map((group) => ({
          description: group.description?.[language],
          fields: transformMultilingualFormFields(group.fields as Types.FormInstrumentFields, language),
          title: group.title[language]
        }))
      : transformMultilingualFormFields(form.content, language),
    details: {
      description: form.details.description[language],
      instructions: form.details.instructions[language],
      title: form.details.title[language]
    },
    language: language,
    measures: mapValues(form.measures, (measure) => ({ label: measure.label[language], value: measure.value })),
    tags: form.tags[language]
  });
}

export function translateFormInstrument<TData extends Base.FormDataType, TLanguage extends Types.Language>(
  form: Types.FormInstrument<TData>,
  language: TLanguage
): Types.UnilingualFormInstrument<TData> | null {
  if (isUnilingualForm(form, language)) {
    return form;
  } else if (isMultilingualForm(form, language)) {
    return translateMultilingualForm(form, language);
  }
  return null;
}
console.log(translateFormInstrument(happinessQuestionnaire, 'en'));
