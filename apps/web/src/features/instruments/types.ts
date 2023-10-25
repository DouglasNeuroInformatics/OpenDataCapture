/** The selected option by the user in the create instrument form */
export type SelectedLanguage = 'bilingual' | 'english' | 'french';

export type InstrumentInfoFormData = {
  description: {
    [K in SelectedLanguage]?: string;
  }[];
  language: SelectedLanguage;
  name: string;
  tags: {
    [K in SelectedLanguage]?: string;
  }[];
  version: number;
};
