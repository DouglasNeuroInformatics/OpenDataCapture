/* eslint-disable perfectionist/sort-objects */

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { z } from 'zod/v4';

import { useAppStore } from '@/store';

type $LoginData = z.infer<typeof $LoginData>;
const $LoginData = z.object({
  apiBaseUrl: z.url(),
  username: z.string().min(1),
  password: z.string().min(1)
});

export type LoginDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const LoginDialog = ({ isOpen, setIsOpen }: LoginDialogProps) => {
  const apiBaseUrl = useAppStore((store) => store.settings.apiBaseUrl);
  const updateSettings = useAppStore((store) => store.updateSettings);

  const addNotification = useNotificationsStore((store) => store.addNotification);

  const handleSubmit = ({ apiBaseUrl }: $LoginData) => {
    updateSettings({ apiBaseUrl });
    addNotification({ type: 'success' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Login</Dialog.Title>
          <Dialog.Description>
            Login to your Open Data Capture instance. A special access token is used that grants permissions to create
            instruments only. You must have permission to create instruments to use this functionality.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="grid gap-4">
          <Form
            content={[
              {
                title: 'Instance Settings',
                fields: {
                  apiBaseUrl: {
                    description: 'The base path for your Open Data Capture REST API.',
                    kind: 'string',
                    placeholder: 'e.g., https://demo.opendatacapture.org/api',
                    label: 'API Base URL',
                    variant: 'input'
                  }
                }
              },
              {
                title: 'Login Credentials',
                fields: {
                  username: {
                    kind: 'string',
                    label: 'Username',
                    variant: 'input'
                  },
                  password: {
                    kind: 'string',
                    label: 'Password',
                    variant: 'password'
                  }
                }
              }
            ]}
            initialValues={{ apiBaseUrl }}
            validationSchema={$LoginData}
            onSubmit={(data) => {
              void handleSubmit(data);
              setIsOpen(false);
            }}
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
