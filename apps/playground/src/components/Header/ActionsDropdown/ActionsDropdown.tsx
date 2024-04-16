import React, { useState } from 'react';

import { AlertDialog, Button, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { EllipsisVerticalIcon } from 'lucide-react';

import { useInstrumentStore } from '@/store/instrument.store';

import { UserSettings } from './UserSettings';

export const ActionsDropdown = () => {
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const defaultInstrument = useInstrumentStore((store) => store.defaultInstrument);
  const removeInstrument = useInstrumentStore((store) => store.removeInstrument);
  const selectedInstrument = useInstrumentStore((store) => store.selectedInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);

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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>This instrument will be deleted from local storage.</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <Button
              variant="danger"
              onClick={() => {
                setSelectedInstrument(defaultInstrument.id);
                removeInstrument(selectedInstrument.id);
                setShowDeleteDialog(false);
                addNotification({ message: 'This preset has been deleted', type: 'success' });
              }}
            >
              Delete
            </Button>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </React.Fragment>
  );
};
