import type { FormInstrument } from '@open-data-capture/common/instrument';

/** The selected option by the user in the create instrument form */
export type LanguageOption = 'bilingual' | 'english' | 'french';

export type FormInstrumentInfoData = Pick<
  FormInstrument,
  'details' | 'kind' | 'language' | 'name' | 'tags' | 'version'
>;
