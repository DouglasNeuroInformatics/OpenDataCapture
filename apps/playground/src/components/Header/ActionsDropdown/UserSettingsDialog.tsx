/* eslint-disable perfectionist/sort-objects */
import React from 'react';

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { z } from 'zod';

import { $Settings } from '@/models/settings.model';
import { useAppStore } from '@/store';

const $SettingsFormData = $Settings
  .omit({ credentials: true })
  .extend({
    password: z.string().optional(),
    username: z.string().optional()
  })
  .superRefine((val, ctx) => {
    if (!val.apiBaseUrl) {
      return;
    }
    if (!val.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'string',
        received: 'undefined',
        path: ['username'],
        message: 'This is a required field when "API Base URL" is set'
      });
    }
    if (!val.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'string',
        received: 'undefined',
        path: ['password'],
        message: 'This is a required field when "API Base URL" is set'
      });
    }
  });

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
          content={[
            {
              title: 'Instance Settings',
              fields: {
                apiBaseUrl: {
                  description:
                    "The base path for your Open Data Capture REST API. If you're not using the functionality to submit instruments to your instance, you can leave this empty.",
                  kind: 'string',
                  placeholder: 'https://demo.opendatacapture.org/api',
                  label: 'API Base URL',
                  variant: 'input'
                },
                username: {
                  kind: 'dynamic',
                  deps: ['apiBaseUrl'],
                  render({ apiBaseUrl }) {
                    if (!apiBaseUrl) {
                      return null;
                    }
                    return {
                      kind: 'string',
                      label: 'Username',
                      variant: 'input'
                    };
                  }
                },
                password: {
                  kind: 'dynamic',
                  deps: ['apiBaseUrl'],
                  render({ apiBaseUrl }) {
                    if (!apiBaseUrl) {
                      return null;
                    }
                    return {
                      kind: 'string',
                      label: 'Password',
                      variant: 'password'
                    };
                  }
                }
              }
            },
            {
              title: 'Editor Settings',
              fields: {
                refreshInterval: {
                  description: 'The interval, in milliseconds, between builds, assuming the source code has changed',
                  kind: 'number',
                  label: 'Refresh Interval',
                  variant: 'input'
                }
              }
            }
          ]}
          initialValues={{
            ...settings,
            ...settings.credentials
          }}
          submitBtnLabel="Save Changes"
          validationSchema={$SettingsFormData}
          onSubmit={({ password, username, ...updatedSettings }) => {
            updateSettings({
              ...updatedSettings,
              credentials:
                username && password
                  ? {
                      username,
                      password
                    }
                  : undefined
            });
            addNotification({ type: 'success' });
            setIsOpen(false);
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
};
