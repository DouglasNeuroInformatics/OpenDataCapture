import type React from 'react';

import type { Merge } from 'type-fest';

import type { Language } from '../..';
import type { BaseInstrument, EnhancedBaseInstrumentDetails } from './base-instrument.types';

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
