import { useContext } from 'react';

import { StepperContext } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';

import { InstrumentOverview } from '../InstrumentOverview';

type InteractiveOverviewProps = {
  instrument: InteractiveInstrument<unknown, Language>;
};

export const InteractiveOverview = ({ instrument }: InteractiveOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  return (
    <InstrumentOverview
      Instrument={instrument}
      onBegin={() => {
        updateIndex('increment');
      }}
    />
  );
};
