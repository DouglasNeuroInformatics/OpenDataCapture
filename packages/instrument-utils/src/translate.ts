import type {
  ArrayFieldset,
  ArrayFieldsetValue,
  FormDataType,
  FormFields,
  PartialFormDataType,
  PrimitiveFormField,
  RequiredArrayFieldsetValue,
  RequiredFormFieldValue,
  StaticFormField
} from '@douglasneuroinformatics/form-types';
import type { Language } from '@open-data-capture/common/core';
import type {
  AnyInstrument,
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrumentArrayFieldset,
  FormInstrumentFields,
  FormInstrumentPrimitiveField,
  FormInstrumentStaticField,
  InstrumentKind,
  InstrumentSummary,
  MultilingualInstrumentMeasures,
  SomeInstrument,
  SomeUnilingualInstrument,
  UnilingualInstrumentMeasures,
  UnilingualInstrumentSummary
} from '@open-data-capture/common/instrument';
import _ from 'lodash';

import {
  isMultilingualInstrument,
  isMultilingualInstrumentSummary,
  isUnilingualInstrument,
  isUnilingualInstrumentSummary
} from './guards';

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
 * Translate a primitive field of an instrument to the user's preferred language.
 *
 * @param field - The primitive field to be translated.
 * @param language - The target language for translation.
 * @returns A translated primitive form field.
 */
function translatePrimitiveField(
  field: FormInstrumentPrimitiveField<Language[]>,
  language: Language
): PrimitiveFormField {
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
          throw new Error(`Unexpected value for property 'variant' in field: ${field}`);
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
      throw new Error(`Unexpected value for property 'kind' in field: ${field}`);
  }
}

/**
 * Translate an array fieldset of an instrument to the user's preferred language.
 *
 * @param fieldset - The array fieldset to be translated.
 * @param language - The target language for translation.
 * @returns A translated array fieldset.
 */
function translateArrayFieldset(
  fieldset: FormInstrumentArrayFieldset<Language[]>,
  language: Language
): ArrayFieldset<RequiredArrayFieldsetValue> {
  const transformedFieldset: FormInstrumentArrayFieldset<Language> = {};
  for (const key in fieldset) {
    const field = fieldset[key];
    if (field.kind === 'dynamic-fieldset') {
      transformedFieldset[key] = {
        kind: 'dynamic-fieldset',
        render: (fieldset: Partial<ArrayFieldsetValue>) => {
          const result: FormInstrumentPrimitiveField<Language[]> | null = field.render(fieldset);
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
): StaticFormField<RequiredFormFieldValue> {
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
        render: _.wrap(field.render, (func, data: PartialFormDataType | null) => {
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
    title: group.title[language]
  }));
}

function translateMeasures(
  measures: MultilingualInstrumentMeasures | undefined,
  language: Language
): UnilingualInstrumentMeasures | undefined {
  if (!measures) {
    return;
  }
  return _.mapValues(measures, (measure) => ({ label: measure.label[language], value: measure.value }));
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
      title: summary.details.title[targetLanguage]
    },
    id: summary.id,
    kind: summary.kind,
    language: targetLanguage,
    measures: translateMeasures(summary.measures, targetLanguage),
    name: summary.name,
    tags: summary.tags[targetLanguage],
    version: summary.version
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
