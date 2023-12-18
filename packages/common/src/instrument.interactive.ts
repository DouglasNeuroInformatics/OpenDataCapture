import type React from 'react';

import type { Jsonifiable, Merge } from 'type-fest';

import type { Language } from './core';
import { type BaseInstrument, type EnhancedBaseInstrumentDetails } from './instrument.base';

export type InteractiveInstrument<
  TData extends Jsonifiable = Jsonifiable,
  TLanguage extends Language = Language
> = Merge<
  BaseInstrument<TData>,
  {
    content: {
      render: (done: (data: TData) => void) => React.ReactNode;
    };
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'interactive';
  }
>;
