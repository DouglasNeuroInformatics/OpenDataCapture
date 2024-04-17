import React from 'react';

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { isUndefined, omitBy } from 'lodash-es';

import { $Settings } from '@/models/settings.model';
import { useSettingsStore } from '@/store/settings.store';

export type UserSettingsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UserSettingsDialog = ({ isOpen, setIsOpen }: UserSettingsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { setSettings, ...settings } = useSettingsStore();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>User Settings</Dialog.Title>
        </Dialog.Header>
        <Form
          className="py-4"
          content={{
            rebuildInterval: {
              description: 'The interval, in milliseconds, between builds, assuming the source code has changed',
              kind: 'number',
              label: 'Rebuild Interval',
              variant: 'input'
            }
          }}
          initialValues={settings}
          submitBtnLabel="Save Changes"
          validationSchema={$Settings.partial()}
          onSubmit={(updatedSettings) => {
            setSettings(omitBy(updatedSettings, isUndefined));
            setIsOpen(false);
            addNotification({ type: 'success' });
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
};
