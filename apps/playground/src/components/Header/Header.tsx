import React from 'react';

import { LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';

import { ActionsDropdown } from '../ActionsDropdown';
import { DownloadButton } from '../DownloadButton';
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
        <ShareButton />
        <ThemeToggle className="h-9 w-9" />
        <LanguageToggle
          align="end"
          options={{
            en: 'English',
            fr: 'Français'
          }}
          triggerClassName="h-9 w-9"
        />
        <DownloadButton />
        <ActionsDropdown />
      </div>
    </header>
  );
};
