import type React from 'react';

import type { Merge } from 'type-fest';

import type { BaseInstrument } from './base-instrument.types';

export type InteractiveInstrument = Merge<
  BaseInstrument,
  {
    content: {
      render: () => React.ReactNode;
    };
    kind: 'interactive';
  }
>;
