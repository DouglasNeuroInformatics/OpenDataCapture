import React from 'react';

import type { AnyUnilingualScalarInstrument } from '@opendatacapture/schemas/instrument';
import type { Promisable } from 'type-fest';

import { FormContent } from '../FormContent';
import { InteractiveContent } from '../InteractiveContent';

export type InstrumentContentProps = {
  bundle: string;
  instrument: AnyUnilingualScalarInstrument;
  onSubmit: (data: unknown) => Promisable<void>;
};

export const InstrumentContent = ({ bundle, instrument, onSubmit }: InstrumentContentProps) => {
  switch (instrument.kind) {
    case 'FORM':
      return <FormContent instrument={instrument} onSubmit={onSubmit} />;
    case 'INTERACTIVE':
      return <InteractiveContent bundle={bundle} onSubmit={onSubmit} />;
    default:
      return null;
  }
};
