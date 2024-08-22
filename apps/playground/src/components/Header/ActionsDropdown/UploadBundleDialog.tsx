/* eslint-disable perfectionist/sort-objects */

import { useEffect, useRef } from 'react';

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { AuthPayload } from '@opendatacapture/schemas/auth';
import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { z } from 'zod';

import { useAppStore } from '@/store';

const $UploadBundleData = z.object({
  apiBaseUrl: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1)
});

type UploadBundleData = z.infer<typeof $UploadBundleData>;

export type UploadBundleDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UploadBundleDialog = ({ isOpen, setIsOpen }: UploadBundleDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const defaultApiBaseUrl = useAppStore((store) => store.settings.apiBaseUrl);
  const transpilerStateRef = useRef(useAppStore.getState().transpilerState);

  useEffect(() => {
    useAppStore.subscribe(
      (store) => store.transpilerState,
      (transpilerState) => {
        transpilerStateRef.current = transpilerState;
      }
    );
  }, []);

  const handleSubmit = async ({ apiBaseUrl, username, password }: UploadBundleData) => {
    const state = transpilerStateRef.current;
    if (state.status === 'building' || state.status === 'initial') {
      addNotification({ message: 'Upload Failed: Transpilation Incomplete', type: 'error' });
      return;
    } else if (state.status === 'error') {
      addNotification({ message: 'Upload Failed: Transpilation Error', type: 'error' });
      return;
    }

    const bundle = state.bundle;
    const loginPath = new URL('/v1/auth/login', apiBaseUrl).href;
    const createInstrumentPath = new URL('/v1/instruments', apiBaseUrl).href;

    let loginResponse: AxiosResponse<AuthPayload>;
    try {
      loginResponse = await axios.post(
        loginPath,
        { username, password },
        {
          headers: {
            Accept: 'application/json'
          },
          validateStatus: (status) => status === 200
        }
      );
    } catch (err) {
      console.error(err);
      let message: string;
      if (isAxiosError(err)) {
        message = err.response ? `${err.response.status} ${err.response.statusText}` : err.message;
      } else {
        message = 'Unknown Error';
      }
      addNotification({ message, type: 'error', title: 'HTTP Request Failed' });
      return;
    }

    const accessToken = loginResponse.data.accessToken;

    let createInstrumentResponse: AxiosResponse;
    try {
      createInstrumentResponse = await axios.post(
        createInstrumentPath,
        { bundle },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          validateStatus: (status) => status === 201
        }
      );
    } catch (err) {
      console.error(err);
      let message: string;
      if (isAxiosError(err)) {
        message = err.response ? `${err.response.status} ${err.response.statusText}` : err.message;
      } else {
        message = 'Unknown Error';
      }
      addNotification({ message, type: 'error', title: 'HTTP Request Failed' });
      return;
    }

    addNotification({
      message: `${createInstrumentResponse.status} ${createInstrumentResponse.statusText}`,
      type: 'success'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Upload Bundle</Dialog.Title>
          <Dialog.Description>
            Upload an instrument to your Open Data Capture instance. This functionality requires that you have added the
            API base URL for your instance to the user settings panel.
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
            initialValues={{
              apiBaseUrl: defaultApiBaseUrl
            }}
            validationSchema={$UploadBundleData}
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
