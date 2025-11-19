/* eslint-disable perfectionist/sort-objects */

import { asyncResultify } from '@douglasneuroinformatics/libjs';
import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import axios from 'axios';
import { CheckIcon, XIcon } from 'lucide-react';
import { err, ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
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
  const isAuthorized = useAppStore((store) => !!store.auth);
  const updateSettings = useAppStore((store) => store.updateSettings);
  const login = useAppStore((store) => store.login);

  const addNotification = useNotificationsStore((store) => store.addNotification);

  const getAdminToken = (credentials: $LoginCredentials): ResultAsync<{ accessToken: string }, string> => {
    return asyncResultify(async () => {
      try {
        const response = await axios.post(`${apiBaseUrl}/v1/auth/login`, credentials, {
          headers: {
            Accept: 'application/json'
          },
          validateStatus: () => true
        });
        if (response.status !== 200) {
          return err(`${response.status}: ${response.statusText}`);
        }
        return ok(await z.object({ accessToken: z.jwt() }).parseAsync(response.data));
      } catch (error) {
        console.error(error);
        return err('Unknown Error');
      }
    });
  };

  const getLimitedToken = (adminToken: string): ResultAsync<{ accessToken: string }, string> => {
    return asyncResultify(async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/v1/auth/create-instrument-token`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          validateStatus: () => true
        });
        if (response.status !== 200) {
          return err(`${response.status}: ${response.statusText}`);
        }
        return ok(await z.object({ accessToken: z.jwt() }).parseAsync(response.data));
      } catch (error) {
        console.error(error);
        return err('Unknown Error');
      }
    });
  };

  const handleSubmit = async ({ apiBaseUrl, ...credentials }: $LoginData) => {
    updateSettings({ apiBaseUrl });
    const adminTokenResult = await getAdminToken(credentials);
    if (adminTokenResult.isErr()) {
      addNotification({ type: 'error', title: 'Login Failed', message: adminTokenResult.error });
      return;
    }
    const limitedTokenResult = await getLimitedToken(adminTokenResult.value.accessToken);
    if (limitedTokenResult.isErr()) {
      addNotification({ type: 'error', title: 'Failed to Get Limited Token', message: limitedTokenResult.error });
      return;
    }

    login(limitedTokenResult.value.accessToken);

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
          <div className="mt-2 flex items-center gap-1 text-sm font-medium">
            {isAuthorized ? (
              <>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600">
                  <CheckIcon className="text-white" style={{ height: '12px', width: '12px' }} />
                </div>
                <span>You are already logged in</span>
              </>
            ) : (
              <>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600">
                  <XIcon className="text-white" style={{ height: '12px', width: '12px' }} />
                </div>
                <span>You are not currently logged in</span>
              </>
            )}
          </div>
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
            onSubmit={async (data) => {
              await handleSubmit(data);
              setIsOpen(false);
            }}
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
