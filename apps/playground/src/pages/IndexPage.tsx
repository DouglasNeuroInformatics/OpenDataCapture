import React from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { InstrumentSelector } from '@/components/InstrumentSelector/InstrumentSelector';

import { PresetActions } from '../components/PresetActions';
import { PresetSave } from '../components/PresetSave';
import { PresetShare } from '../components/PresetShare';

const IndexPage = () => {
  return (
    <div className="hidden h-full flex-col md:flex">
      <div className="container flex h-16 flex-row items-center justify-between space-y-0 py-4">
        <h2 className="text-lg font-semibold">Playground</h2>
        <div className="flex space-x-2">
          <InstrumentSelector />
          <PresetSave />
          <div className="flex">
            <PresetShare />
          </div>
          <PresetActions />
        </div>
      </div>
      <Separator />
    </div>
  );
};

export default IndexPage;
