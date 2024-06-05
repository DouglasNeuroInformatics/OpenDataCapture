import type {
  Fieldset,
  FieldsetValue,
  FormDataType,
  FormFields,
  NonNullableRecord,
  PartialFormDataType,
  RequiredFieldValue,
  ScalarFormField,
  StaticFormField
} from '@douglasneuroinformatics/libui-form-types';
import type { Language } from '@opendatacapture/schemas/core';
import type {
  AnyInstrument,
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrumentFields,
  FormInstrumentFieldset,
  FormInstrumentScalarField,
  FormInstrumentStaticField,
  InstrumentKind,
  InstrumentSummary,
  MultilingualInstrumentMeasures,
  SomeInstrument,
  SomeUnilingualInstrument,
  UnilingualInstrumentMeasures,
  UnilingualInstrumentSummary
} from '@opendatacapture/schemas/instrument';
import { mapValues, wrap } from 'lodash-es';
import { P, match } from 'ts-pattern';

import {
  isMultilingualInstrument,
  isMultilingualInstrumentSummary,
  isUnilingualInstrument,
  isUnilingualInstrumentSummary
} from './guards.js';

/**
 * Determine the target language for translation based on instrument and preferred language.
 *
 * @param instrument - The instrument to be translated.
 * @param preferredLanguage - The user's preferred language.
 * @returns The target language for translation.
 */
function getTargetLanguage(instrument: Pick<AnyInstrument, 'language'>, preferredLanguage: Language): Language {
  if (typeof instrument.language === 'string') {
    return instrument.language;
  } else if (instrument.language.includes(preferredLanguage)) {
    return preferredLanguage;
  }
  return instrument.language[0];
}

/**
 * Translate a scalar field of an instrument to the user's preferred language.
 *
 * @param field - The scalar field to be translated.
 * @param language - The target language for translation.
 * @returns A translated scalar form field.
 */
function translateScalarField(field: FormInstrumentScalarField<Language[]>, language: Language): ScalarFormField {
  const base = {
    description: field.description?.[language],
    label: field.label[language]
  };
  return match(field)
    .with(
      P.union(
        { kind: 'boolean', variant: 'checkbox' },
        { kind: 'date' },
        { kind: 'string', variant: P.union('input', 'password', 'textarea') },
        { kind: 'number', variant: P.union('input', 'slider') }
      ),
      (field) => ({ ...field, ...base })
    )
    .with(P.union({ kind: 'boolean', variant: 'radio' }), (field) => ({
      ...field,
      ...base,
      options: field.options?.[language]
    }))
    .with(
      { kind: 'number', variant: P.union('radio', 'select') },
      { kind: 'set' },
      { kind: 'string', variant: P.union('radio', 'select') },
      (field) => ({
        ...field,
        ...base,
        options: field.options[language]
      })
    )
    .exhaustive();
}

/**
 * Translate a record array fieldset of an instrument to the user's preferred language.
 *
 * @param fieldset - The record array fieldset to be translated.
 * @param language - The target language for translation.
 * @returns A translated record array fieldset.
 */
function translateRecordArrayFieldset(
  fieldset: FormInstrumentFieldset<Language[]>,
  language: Language
): Fieldset<NonNullableRecord<FieldsetValue>> {
  const transformedFieldset: FormInstrumentFieldset<Language> = {};
  for (const key in fieldset) {
    fieldset[key];
    const field = fieldset[key];
    if (field.kind === 'dynamic') {
      transformedFieldset[key] = {
        kind: 'dynamic',
        render: (fieldset: Partial<FieldsetValue>) => {
          const result: FormInstrumentScalarField<Language[]> | null = field.render(fieldset);
          if (result === null) {
            return null;
          }
          return translateScalarField(result, language);
        }
      };
    } else {
      transformedFieldset[key] = translateScalarField(field, language);
    }
  }
  return transformedFieldset;
}

/**
 * Translate a static field of an instrument to the user's preferred language.
 *
 * @param field - The static field to be translated.
 * @param language - The target language for translation.
 * @returns A translated static form field.
 */
function translateStaticField(
  field: FormInstrumentStaticField<Language[]>,
  language: Language
): StaticFormField<RequiredFieldValue> {
  return match(field)
    .with({ kind: 'record-array' }, (field) => ({
      ...field,
      description: field.description?.[language],
      fieldset: translateRecordArrayFieldset(field.fieldset, language),
      label: field.label[language]
    }))
    .with({ kind: 'number-record' }, (field) => {
      return {
        ...field,
        description: field.description?.[language],
        items: mapValues(field.items, (item) => ({
          description: item.description?.[language],
          label: item.label[language]
        })),
        label: field.label[language],
        options: field.options[language]
      };
    })
    .with({ kind: P.union('boolean', 'date', 'number', 'set', 'string') }, (field) =>
      translateScalarField(field, language)
    )
    .exhaustive();
}

/**
 * Translate a set of form fields of an instrument to the user's preferred language.
 *
 * @param fields - The form fields to be translated.
 * @param language - The target language for translation.
 * @returns Translated form fields.
 */
function translateFormFields(
  fields: Partial<FormInstrumentFields<FormDataType, Language[]>>,
  language: Language
): FormFields {
  const translatedFields: FormFields = {};
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (!field) {
      continue;
    }
    if (field.kind === 'dynamic') {
      translatedFields[fieldName] = {
        deps: field.deps,
        kind: 'dynamic',
        render: wrap(field.render, (func, data: PartialFormDataType) => {
          const result = func(data);
          if (result === null) {
            return null;
          }
          return translateStaticField(result, language);
        })
      };
    } else {
      translatedFields[fieldName] = translateStaticField(field, language);
    }
  }
  return translatedFields;
}

/**
 * Translate the content of a multilingual form instrument to the user's preferred language.
 *
 * @param content - The content of the instrument.
 * @param language - The target language for translation.
 * @returns Translated content of a unilingual form instrument.
 */
function translateFormContent(
  content: AnyMultilingualFormInstrument['content'],
  language: Language
): AnyUnilingualFormInstrument['content'] {
  if (!Array.isArray(content)) {
    return translateFormFields(content, language);
  }
  return content.map((group) => ({
    description: group.description?.[language],
    fields: translateFormFields(group.fields, language),
    title: group.title?.[language]
  }));
}

function translateMeasures(
  measures: MultilingualInstrumentMeasures | null,
  language: Language
): UnilingualInstrumentMeasures | null {
  if (!measures) {
    return null;
  }
  return mapValues(measures, (measure) => {
    switch (measure.kind) {
      case 'computed':
        return { ...measure, label: measure.label[language] };
      default:
        return { ...measure, label: measure.label?.[language] };
    }
  });
}

/**
 * Translate a multilingual form instrument to the user's preferred language.
 *
 * @param form - the form instrument
 * @param language - The target language for translation.
 * @returns A translated unilingual form instrument.
 */
function translateForm(form: AnyMultilingualFormInstrument, language: Language): AnyUnilingualFormInstrument {
  return {
    ...form,
    content: translateFormContent(form.content, language),
    details: {
      description: form.details.description[language],
      estimatedDuration: form.details.estimatedDuration,
      instructions: form.details.instructions?.[language],
      license: form.details.license,
      title: form.details.title[language]
    },
    language: language,
    measures: translateMeasures(form.measures, language),
    tags: form.tags[language]
  };
}

/**
 * Translate an instrument summary to the user's preferred language.
 *
 * If the instrument is a unilingual instrument summary, it will be returned as is. Otherwise, it will
 * be translated to the user's preferred language, or, if that is not available, the first element
 * in an array of languages.
 *
 * @param summary - The instrument to be translated.
 * @param preferredLanguage - The user's preferred language.
 * @returns A translated unilingual instrument.
 */
export function translateInstrumentSummary(
  summary: InstrumentSummary,
  preferredLanguage: Language
): UnilingualInstrumentSummary {
  if (isUnilingualInstrumentSummary(summary)) {
    return summary;
  } else if (!isMultilingualInstrumentSummary(summary)) {
    throw new Error(`Unexpected value for property 'language': ${JSON.stringify(summary.language)}`);
  }
  const targetLanguage = getTargetLanguage(summary, preferredLanguage);
  return {
    details: {
      description: summary.details.description[targetLanguage],
      license: summary.details.license,
      title: summary.details.title[targetLanguage]
    },
    edition: summary.edition,
    id: summary.id,
    kind: summary.kind,
    language: targetLanguage,
    name: summary.name,
    tags: summary.tags[targetLanguage]
  };
}

/**
 * Translate an instrument to the user's preferred language.
 *
 * If the instrument is a unilingual instrument, it will be returned as is. Otherwise, it will
 * be translated to the user's preferred language, or, if that is not available, the first element
 * in an array of languages.
 *
 * @param instrument - The instrument to be translated.
 * @param preferredLanguage - The user's preferred language.
 * @returns A translated unilingual instrument.
 */
export function translateInstrument<const TKind extends InstrumentKind>(
  instrument: SomeInstrument<TKind>,
  preferredLanguage: Language
): SomeUnilingualInstrument<TKind> {
  if (isUnilingualInstrument(instrument)) {
    return instrument;
  } else if (!isMultilingualInstrument(instrument)) {
    throw new Error(`Unexpected value for property 'language': ${JSON.stringify(instrument.language)}`);
  }
  const targetLanguage = getTargetLanguage(instrument, preferredLanguage);
  switch (instrument.kind) {
    case 'FORM':
      return translateForm(instrument, targetLanguage) as SomeUnilingualInstrument<TKind>;
    default:
      throw new Error(`Unexpected instrument kind: ${instrument.kind}`);
  }
}
