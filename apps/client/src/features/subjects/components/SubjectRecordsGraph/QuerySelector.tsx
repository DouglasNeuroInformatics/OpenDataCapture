import React from 'react';

import { FormInstrument } from '@douglasneuroinformatics/common';
import { LegendProps } from 'recharts';

export type QuerySelectorProps = LegendProps & {
  instruments: Array<FormInstrument & { identifier: string }>;
};

export const QuerySelector = ({ payload, instruments }: QuerySelectorProps) => {
  return (
    <div className="h-full">
      <div>
        <h5>Instruments</h5>
        {instruments.map((instrument) => (
          <span key={instrument.identifier}>{instrument.details.title}</span>
        ))}
      </div>
      <div>
        <h5>Fields</h5>
      </div>
      <ul>
        {payload?.map((entry, index) => (
          <li key={`item-${index}`}>{entry.value}</li>
        ))}
      </ul>
    </div>
  );
};
