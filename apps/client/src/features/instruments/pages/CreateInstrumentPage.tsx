import React from 'react';

import { FormInstrumentBuilder } from '../components/FormInstrumentBuilder';

import { PageHeader } from '@/components';

export const CreateInstrumentPage = () => {
  return (
    <div>
      <PageHeader title="Create Instrument" />
      <FormInstrumentBuilder />
    </div>
  );
};
