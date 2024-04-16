import React, { useState } from 'react';

import { Button, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { EllipsisVerticalIcon } from 'lucide-react';

import { useInstrumentStore } from '@/store/instrument.store';

import { DeleteInstrument } from './DeleteInstrument';
import { UserSettings } from './UserSettings';

export const ActionsDropdown = () => {
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
          <DropdownMenu.Item asChild onSelect={() => setShowUserSettings(true)}>
            <button disabled className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" type="button">
              User Settings
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item asChild onSelect={() => setShowDeleteDialog(true)}>
            <button
              className="cursor-pointer text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
              disabled={selectedInstrument.category !== 'Saved'}
              type="button"
            >
              Delete Instrument
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <UserSettings isOpen={showUserSettings} setIsOpen={setShowUserSettings} />
      <DeleteInstrument isOpen={showDeleteDialog} setIsOpen={setShowDeleteDialog} />
    </React.Fragment>
  );
};
