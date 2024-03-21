import type { Language } from '@open-data-capture/common/core';
import type { i18n } from 'i18next';
import type { EmptyObject, ValueOf } from 'type-fest';

export type TranslationsDef = { [key: string]: { [key: string]: unknown } };

export type TranslatedResource<T = EmptyObject> = {
  [K in keyof T]: T[K] extends { [key: string]: unknown }
    ? T[K] extends { [key: Language]: unknown }
      ? ValueOf<T[K]>
      : TranslatedResource<T[K]>
    : T[K];
};

export type ExtendedI18NextInstance = i18n & {
  initialize: () => Promise<void>;
};
