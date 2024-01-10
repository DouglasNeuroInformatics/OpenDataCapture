import { useContext } from 'react';

import { StepperContext } from '@douglasneuroinformatics/ui';
import type { BaseModelKeys, Json, Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';

import { InstrumentOverview } from '../InstrumentOverview';

type InteractiveOverviewProps = {
  instrument: Omit<InteractiveInstrument<Json, Language>, BaseModelKeys>;
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
