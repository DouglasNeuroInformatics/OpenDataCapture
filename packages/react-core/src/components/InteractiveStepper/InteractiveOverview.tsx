import { useContext } from 'react';

import { StepperContext } from '@douglasneuroinformatics/ui';
import type { Json, Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';

import { InstrumentOverview } from '../InstrumentOverview';

type InteractiveOverviewProps = {
  instrument: InteractiveInstrument<Json, Language>;
};

export const InteractiveOverview = ({ instrument }: InteractiveOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  return (
    <InstrumentOverview
      instrument={instrument}
      onBegin={() => {
        updateIndex('increment');
      }}
    />
  );
};
