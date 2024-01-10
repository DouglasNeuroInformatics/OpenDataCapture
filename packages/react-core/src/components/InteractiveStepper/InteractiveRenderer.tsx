import { useCallback, useContext } from 'react';

import { StepperContext } from '@douglasneuroinformatics/ui';
import type { BaseModelKeys, Json, Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';

export type InteractiveRendererProps = {
  instrument: Omit<InteractiveInstrument<Json, Language>, BaseModelKeys>;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InteractiveRenderer = ({ instrument, onSubmit }: InteractiveRendererProps) => {
  const { updateIndex } = useContext(StepperContext);

  const done = useCallback((data: unknown) => {
    void onSubmit(data).then(() => {
      updateIndex('increment');
    });
  }, []);

  return <div>{instrument.content.render(done)}</div>;
};
