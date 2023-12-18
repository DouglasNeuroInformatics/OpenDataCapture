import type React from 'react';

import type { Merge } from 'type-fest';

import type { Language } from './core';
import type { BaseInstrument, EnhancedBaseInstrumentDetails } from './instrument.base';

export type InteractiveInstrument<TData = unknown, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData>,
  {
    content: {
      render: (done: (data: TData) => void) => React.ReactNode;
    };
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'interactive';
  }
>;
