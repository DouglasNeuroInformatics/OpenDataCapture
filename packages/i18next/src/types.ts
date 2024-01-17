import type { Language } from '@open-data-capture/common/core';
import type { EmptyObject, ValueOf } from 'type-fest';

export type TranslationsDef = Record<string, Record<string, unknown>>;

export type TranslatedResource<T = EmptyObject> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? T[K] extends Record<Language, unknown>
      ? ValueOf<T[K]>
      : TranslatedResource<T[K]>
    : T[K];
};
