import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { FormInstrument, Language, MultilingualFormInstrument, UnilingualFormInstrument } from '@open-data-capture/types';

function isUnilingualForm<TData extends FormDataType>(
  instrument: FormInstrument<TData>
): instrument is UnilingualFormInstrument<TData> {
  return typeof instrument.language === 'string';
}

function assertIsMultilingualForm<TData extends FormDataType>(
  instrument: FormInstrument<TData>
): asserts instrument is MultilingualFormInstrument<TData> {
  if (!Array.isArray(instrument.language)) {
    throw new Error(`Unexpected value for language in multilingual form: ${JSON.stringify(instrument.language)}`);
  }
}

function translateItem<T>(item: T, languages: Language[]) {
  if (typeof item !== 'object' || ) 

}

export function translateInstrument<TData extends FormDataType>(instrument: FormInstrument<TData>) {
  if (isUnilingualForm(instrument)) {
    return instrument satisfies UnilingualFormInstrument<TData>;
  }
  assertIsMultilingualForm(instrument);

  instrument.language;
}
