import React from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { presets } from '../../data/presets';
import { PresetActions } from '../PresetActions';
import { PresetSave } from '../PresetSave';
import { PresetSelector } from '../PresetSelector';
import { PresetShare } from '../PresetShare';

export const IndexPage = () => {
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
