import React from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { PresetActions } from '../components/PresetActions';
import { PresetSave } from '../components/PresetSave';
import { PresetSelector } from '../components/PresetSelector';
import { PresetShare } from '../components/PresetShare';
import { presets } from '../data/presets';

const IndexPage = () => {
  return (
    <div className="hidden h-full flex-col md:flex">
      <div className="container flex h-16 flex-row items-center justify-between space-y-0 py-4">
        <h2 className="text-lg font-semibold">Playground</h2>
        <div className="flex space-x-2">
          <PresetSelector presets={presets} />
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
