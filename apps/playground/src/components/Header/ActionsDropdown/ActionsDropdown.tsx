import React, { useState } from 'react';

import { AlertDialog, Button, Dialog, DropdownMenu, Label, Switch } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { EllipsisVerticalIcon } from 'lucide-react';

import { useInstrumentStore } from '@/store/instrument.store';

export const ActionsDropdown = () => {
  const [open, setIsOpen] = useState(false);
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
          <DropdownMenu.Item asChild onSelect={() => setIsOpen(true)}>
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
      <Dialog open={open} onOpenChange={setIsOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>User Settings</Dialog.Title>
            <Dialog.Description>
              The content filter flags text that may violate our content policy. It&apos;s powered by our moderation
              endpoint which is free to use to moderate your OpenAI API traffic. Learn more.
            </Dialog.Description>
          </Dialog.Header>
          <div className="py-6">
            <h4 className="text-muted-foreground text-sm">Playground Warnings</h4>
            <div className="flex items-start justify-between space-x-4 pt-3">
              <Switch defaultChecked={true} id="show" name="show" />
              <Label className="grid gap-1 font-normal" htmlFor="show">
                <span className="font-semibold">Show a warning when content is flagged</span>
                <span className="text-muted-foreground text-sm">
                  A warning will be shown when sexual, hateful, violent or self-harm content is detected.
                </span>
              </Label>
            </div>
          </div>
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
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
