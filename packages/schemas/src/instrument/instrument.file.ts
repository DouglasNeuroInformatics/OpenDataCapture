import type { FileInstrument, InstrumentLanguage } from '@opendatacapture/runtime-core';
import { FILE_TYPES } from '@opendatacapture/runtime-core/constants';
import { z } from 'zod/v4';

import { $$InstrumentUIOption, $$ScalarInstrument } from './instrument.base.js';

type $FileType = z.infer<typeof $FileType>;
const $FileType = z.enum(
  [FILE_TYPES.binary, FILE_TYPES.documents, FILE_TYPES.images, FILE_TYPES.spreadsheets, FILE_TYPES.structured].flat()
) satisfies z.ZodType<FileInstrument.FileType>;

const $$FileGroup = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    basename: z.string(),
    count: z.object({
      max: z.int().positive(),
      min: z.int().positive()
    }),
    label: $$InstrumentUIOption(z.string(), language),
    type: $FileType.nullable()
  }) satisfies z.ZodType<FileInstrument.FileGroup>;
};

const $$FileInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$ScalarInstrument(language).extend({
    content: z.object({
      fileGroups: z.array($$FileGroup(language))
    }),
    kind: z.literal('FILE')
  }) satisfies z.ZodType<FileInstrument<TLanguage>>;
};

const $FileInstrument = $$FileInstrument() satisfies z.ZodType<FileInstrument>;

export { $$FileInstrument, $FileInstrument };
