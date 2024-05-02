import React from 'react';

import { LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { Branding } from '@opendatacapture/react-core';

import { ActionsDropdown } from './ActionsDropdown';
import { CloneButton } from './CloneButton';
import { DownloadButton } from './DownloadButton';
import { InstrumentSelector } from './InstrumentSelector';
import { RefreshButton } from './RefreshButton';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';

export const Header = () => {
  return (
    <header className="flex flex-col gap-4 py-4 md:flex-row md:gap-2">
      <div className="hidden flex-grow md:flex md:items-center">
        <Branding className="[&>span]:hidden lg:[&>span]:inline" />
      </div>
      <div className="mx-auto w-full max-w-lg md:w-96">
        <InstrumentSelector />
      </div>
      <div className="mx-auto grid w-full max-w-lg grid-cols-8 gap-2 md:w-auto md:max-w-none">
        <div className="flex items-center justify-center">
          <SaveButton />
        </div>
        <div className="flex items-center justify-center">
          <CloneButton />
        </div>
        <div className="flex items-center justify-center">
          <ShareButton />
        </div>
        <div className="flex items-center justify-center">
          <ThemeToggle className="h-9 w-9" />
        </div>
        <div className="flex items-center justify-center">
          <LanguageToggle
            align="end"
            options={{
              en: 'English',
              fr: 'Français'
            }}
            triggerClassName="h-9 w-9"
          />
        </div>
        <div className="flex items-center justify-center">
          <DownloadButton />
        </div>
        <div className="flex items-center justify-center">
          <RefreshButton />
        </div>
        <div className="flex items-center justify-center">
          <ActionsDropdown />
        </div>
      </div>
    </header>
  );
};
