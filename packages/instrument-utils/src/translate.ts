import type {
  AnyInstrument,
  AnyMultilingualFormInstrument,
  AnyMultilingualInteractiveInstrument,
  AnyUnilingualFormInstrument,
  AnyUnilingualInstrument,
  AnyUnilingualInteractiveInstrument,
  FormInstrument,
  FormTypes,
  Language,
  MultilingualClientInstrumentDetails,
  MultilingualInstrumentDetails,
  MultilingualInstrumentMeasures,
  SeriesInstrument,
  UnilingualClientInstrumentDetails,
  UnilingualInstrumentMeasures
} from '@opendatacapture/runtime-core';
import type { InstrumentInfo, TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { mapValues, wrap } from 'lodash-es';
import { match, P } from 'ts-pattern';

import {
  isFormInstrument,
  isInteractiveInstrument,
  isMultilingualInstrument,
  isMultilingualInstrumentInfo,
  isSeriesInstrument,
  isUnilingualInstrument,
  isUnilingualInstrumentInfo
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
  return instrument.language[0]!;
}

/**
 * Translate a scalar field of an instrument to the user's preferred language.
 *
 * @param field - The scalar field to be translated.
 * @param language - The target language for translation.
 * @returns A translated scalar form field.
 */
function translateScalarField(
  field: FormInstrument.ScalarField<Language[]>,
  language: Language
): FormInstrument.ScalarField<Language> {
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
  fieldset: FormInstrument.Fieldset<Language[]>,
  language: Language
): FormInstrument.Fieldset<Language> {
  const transformedFieldset: FormInstrument.Fieldset<Language> = {};
  for (const key in fieldset) {
    const field = fieldset[key]!;
    if (field.kind === 'dynamic') {
      transformedFieldset[key] = {
        kind: 'dynamic',
        render: (fieldset: Partial<FormTypes.FieldsetValue>) => {
          const result: FormInstrument.ScalarField<Language[]> | null = field.render(fieldset);
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
  field: FormInstrument.StaticField<Language[]>,
  language: Language
): FormInstrument.StaticField<Language> {
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
  fields: Partial<FormInstrument.Fields<FormInstrument.Data, Language[]>>,
  language: Language
): FormInstrument.Fields<FormInstrument.Data, Language> {
  const translatedFields: FormInstrument.Fields<FormInstrument.Data, Language> = {};
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (!field) {
      continue;
    }
    if (field.kind === 'dynamic') {
      translatedFields[fieldName] = {
        deps: field.deps,
        kind: 'dynamic',
        render: wrap(field.render, (func, data: FormInstrument.PartialData) => {
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
): null | UnilingualInstrumentMeasures {
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

function translateDetails<TDetails extends MultilingualInstrumentDetails>(details: TDetails, language: Language) {
  return {
    ...details,
    description: details.description[language],
    instructions: details.instructions?.[language],
    license: details.license,
    title: details.title[language]
  };
}

function translateClientDetails(
  details: MultilingualClientInstrumentDetails | undefined,
  language: Language
): undefined | UnilingualClientInstrumentDetails {
  if (!details) {
    return undefined;
  }
  return {
    ...details,
    instructions: details.instructions?.[language],
    title: details.title?.[language]
  };
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
    clientDetails: translateClientDetails(form.clientDetails, language),
    content: translateFormContent(form.content, language),
    details: translateDetails(form.details, language),
    language,
    measures: translateMeasures(form.measures, language),
    tags: form.tags[language]
  };
}

function translateInteractive(
  instrument: AnyMultilingualInteractiveInstrument,
  language: Language
): AnyUnilingualInteractiveInstrument {
  return {
    ...instrument,
    clientDetails: translateClientDetails(instrument.clientDetails, language),
    details: translateDetails(instrument.details, language),
    language,
    // Because of the JSON data type, the measures is different since there cannot be a ref, but this is irrelevant for translation
    measures: translateMeasures(instrument.measures as MultilingualInstrumentMeasures, language),
    tags: instrument.tags[language]
  };
}

function translateSeries(series: SeriesInstrument<Language[]>, language: Language): SeriesInstrument<Language> {
  return {
    ...series,
    clientDetails: translateClientDetails(series.clientDetails, language),
    details: translateDetails(series.details, language),
    language,
    tags: series.tags[language]
  };
}

/**
 * Translate instrument info to the user's preferred language.
 *
 * If the instrument is a unilingual instrument info, it will be returned as is. Otherwise, it will
 * be translated to the user's preferred language, or, if that is not available, the first element
 * in an array of languages.
 *
 * @param info - The instrument to be translated.
 * @param preferredLanguage - The user's preferred language.
 * @returns A translated unilingual instrument.
 */
export function translateInstrumentInfo(info: InstrumentInfo, preferredLanguage: Language): TranslatedInstrumentInfo {
  if (isUnilingualInstrumentInfo(info)) {
    return { ...info, supportedLanguages: [info.language] };
  } else if (!isMultilingualInstrumentInfo(info)) {
    throw new Error(`Unexpected value for property 'language': ${JSON.stringify(info.language)}`);
  }
  const targetLanguage = getTargetLanguage(info, preferredLanguage);
  return {
    ...info,
    clientDetails: translateClientDetails(info.clientDetails, targetLanguage),
    details: translateDetails(info.details, targetLanguage),
    language: targetLanguage,
    supportedLanguages: info.language,
    tags: info.tags[targetLanguage]
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
export function translateInstrument(instrument: AnyInstrument, preferredLanguage: Language): AnyUnilingualInstrument {
  if (isUnilingualInstrument(instrument)) {
    return instrument;
  } else if (!isMultilingualInstrument(instrument)) {
    throw new Error(`Unexpected value for property 'language': ${JSON.stringify(instrument.language)}`);
  }
  const targetLanguage = getTargetLanguage(instrument, preferredLanguage);
  if (isFormInstrument(instrument)) {
    return translateForm(instrument, targetLanguage);
  } else if (isSeriesInstrument(instrument)) {
    return translateSeries(instrument, targetLanguage);
  } else if (isInteractiveInstrument(instrument)) {
    return translateInteractive(instrument, targetLanguage);
  }
  throw new Error(`Unexpected instrument kind: ${(instrument as AnyInstrument).kind}`);
}
