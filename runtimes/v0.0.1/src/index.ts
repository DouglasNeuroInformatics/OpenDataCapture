import * as React from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { CoreModule as CM } from '@open-data-capture/common';
import type { InstrumentModule as IM } from '@open-data-capture/common';
import { z } from 'zod';

type DiscriminatedInstrumentData<TKind extends IM.InstrumentKind> = [TKind] extends ['form']
  ? FormDataType
  : [TKind] extends ['interactive']
    ? CM.Json
    : never;

type DiscriminatedInstrument<
  TKind extends IM.InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends IM.InstrumentLanguage
> = [TKind] extends ['form']
  ? TData extends FormDataType
    ? IM.StrictFormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['interactive']
    ? TData extends CM.Json
      ? IM.InteractiveInstrument<TData, TLanguage>
      : never
    : never;

type InstrumentDef<
  TKind extends IM.InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends IM.InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage>, 'kind' | 'language'>;

export class InstrumentFactory<TKind extends IM.InstrumentKind, TLanguage extends IM.InstrumentLanguage> {
  constructor(private options: { kind: TKind; language: TLanguage }) {}

  defineInstrument<TData extends DiscriminatedInstrumentData<TKind>>(def: InstrumentDef<TKind, TData, TLanguage>) {
    return { ...this.options, ...def };
  }
}

export { React, z };
