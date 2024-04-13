import React from 'react';

import { ActionsDropdown } from '../ActionsDropdown';
import { InstrumentSelector } from '../InstrumentSelector/InstrumentSelector';
import { SaveButton } from '../SaveButton';
import { ShareButton } from '../ShareButton';

export const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between py-4">
      <h2 className="text-lg font-semibold">Playground</h2>
      <div className="flex space-x-2">
        <InstrumentSelector />
        <SaveButton />
        <div className="flex">
          <ShareButton />
        </div>
        <ActionsDropdown />
      </div>
    </header>
  );
};
