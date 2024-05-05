import React from 'react';

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';

import { $Settings } from '@/models/settings.model';
import { useAppStore } from '@/store';

export type UserSettingsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UserSettingsDialog = ({ isOpen, setIsOpen }: UserSettingsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const settings = useAppStore((store) => store.settings);
  const updateSettings = useAppStore((store) => store.updateSettings);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>User Settings</Dialog.Title>
        </Dialog.Header>
        <Form
          className="py-4"
          content={{
            refreshInterval: {
              description: 'The interval, in milliseconds, between builds, assuming the source code has changed',
              kind: 'number',
              label: 'Refresh Interval',
              variant: 'input'
            }
          }}
          initialValues={settings}
          submitBtnLabel="Save Changes"
          validationSchema={$Settings.partial()}
          onSubmit={(updatedSettings) => {
            updateSettings(updatedSettings);
            addNotification({ type: 'success' });
            setIsOpen(false);
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
};
