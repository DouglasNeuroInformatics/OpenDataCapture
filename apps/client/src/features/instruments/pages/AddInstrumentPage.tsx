import React from 'react';

import { FormInstrumentBuilder } from '../components/FormInstrumentBuilder';

import { PageHeader } from '@/components';

export const AddInstrumentPage = () => {
  return (
    <div>
      <PageHeader title="Add Instrument" />
      <FormInstrumentBuilder />
    </div>
  );
};
