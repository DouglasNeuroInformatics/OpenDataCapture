import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { StepperContext } from '@douglasneuroinformatics/ui';
import type { BaseModelKeys, Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';

import { InstrumentOverview } from '../InstrumentOverview';

type FormOverviewProps = {
  form: Omit<FormInstrument<FormDataType, Language>, BaseModelKeys>;
};

export const FormOverview = ({ form }: FormOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  return (
    <InstrumentOverview
      instrument={form}
      onBegin={() => {
        updateIndex('increment');
      }}
    />
  );
};
