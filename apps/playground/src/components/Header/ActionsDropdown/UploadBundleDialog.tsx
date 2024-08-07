/* eslint-disable perfectionist/sort-objects */
import React from 'react';

import { Button, Dialog, Input, Label } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type UploadBundleDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UploadBundleDialog = ({ isOpen, setIsOpen }: UploadBundleDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const settings = useAppStore((store) => store.settings);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Upload Bundle</Dialog.Title>
          <Dialog.Description>
            Upload an instrument to your Open Data Capture instance. This functionality requires that you have added the
            base URL for your instance to the user settings panel.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="api-base-url">API Base URL</Label>
            <Input readOnly className="cursor-not-allowed opacity-80" id="api-base-url" value={settings.apiBaseUrl} />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            disabled={!settings.apiBaseUrl}
            type="button"
            onClick={() => {
              addNotification({ type: 'success' });
              setIsOpen(false);
            }}
          >
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
