/* eslint-disable @typescript-eslint/no-namespace */

import type { Merge } from 'type-fest';

import type { FILE_TYPES } from '../constants.js';
import type { Language } from './core.js';
import type { InstrumentLanguage, InstrumentUIOption, ScalarInstrument } from './instrument.base.js';

/** @public */
declare namespace FileInstrument {
  export type Data = {
    [key: string]: never;
  };

  export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES][number];

  export type FileGroup<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
    basename: string;
    count: {
      max: number;
      min: number;
    };
    label: InstrumentUIOption<TLanguage, string>;
    type: FileType | null;
  };

  export type Content<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
    fileGroups: FileGroup<TLanguage>[];
  };
}

/** @public */
declare type FileInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  ScalarInstrument<FileInstrument.Data, TLanguage>,
  {
    content: FileInstrument.Content<TLanguage>;
    kind: 'FILE';
  }
>;

/** @internal */
type AnyUnilingualFileInstrument = FileInstrument<Language>;

/** @internal */
type AnyMultilingualFileInstrument = FileInstrument<Language[]>;

export type { AnyMultilingualFileInstrument, AnyUnilingualFileInstrument, FileInstrument };
