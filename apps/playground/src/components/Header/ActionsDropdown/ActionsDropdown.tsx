import React, { useState } from 'react';

import { Button, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { EllipsisVerticalIcon } from 'lucide-react';

import { useInstrumentStore } from '@/store/instrument.store';

import { DeleteInstrumentDialog } from './DeleteInstrumentDialog';
import { RestoreDefaultsDialog } from './RestoreDefaultsDialog';
import { UserSettingsDialog } from './UserSettingsDialog';

export const ActionsDropdown = () => {
  const [showUserSettingsDialog, setShowUserSettingsDialog] = useState(false);
  const [showDeleteInstrumentDialog, setShowDeleteInstrumentDialog] = useState(false);
  const [showRestoreDefaultsDialog, setShowRestoreDefaultsDialog] = useState(false);

  const selectedInstrument = useInstrumentStore((store) => store.selectedInstrument);

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button className="h-9 w-9" size="icon" variant="outline">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item asChild onSelect={() => setShowUserSettingsDialog(true)}>
            <button className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" type="button">
              User Settings
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item asChild onSelect={() => setShowDeleteInstrumentDialog(true)}>
            <button
              className="cursor-pointer text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
              disabled={selectedInstrument.category !== 'Saved'}
              type="button"
            >
              Delete Instrument
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item asChild onSelect={() => setShowRestoreDefaultsDialog(true)}>
            <button
              className="cursor-pointer text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
              type="button"
            >
              Restore Defaults
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <UserSettingsDialog isOpen={showUserSettingsDialog} setIsOpen={setShowUserSettingsDialog} />
      <DeleteInstrumentDialog isOpen={showDeleteInstrumentDialog} setIsOpen={setShowDeleteInstrumentDialog} />
      <RestoreDefaultsDialog isOpen={showRestoreDefaultsDialog} setIsOpen={setShowRestoreDefaultsDialog} />
    </React.Fragment>
  );
};
