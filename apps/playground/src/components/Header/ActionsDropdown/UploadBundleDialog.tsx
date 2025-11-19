/* eslint-disable perfectionist/sort-objects */

import { useEffect, useRef } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import axios, { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

import { useAppStore } from '@/store';

export type UploadBundleDialogProps = {
  isOpen: boolean;
  onLoginRequired: () => void;
  setIsOpen: (value: boolean) => void;
};

export const UploadBundleDialog = ({ isOpen, setIsOpen, onLoginRequired }: UploadBundleDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const auth = useAppStore((store) => store.auth);
  const apiBaseUrl = useAppStore((store) => store.settings.apiBaseUrl);
  const revalidateToken = useAppStore((store) => store.revalidateToken);

  const transpilerStateRef = useRef(useAppStore.getState().transpilerState);

  useEffect(() => {
    revalidateToken();
  }, [isOpen]);

  useEffect(() => {
    useAppStore.subscribe(
      (store) => store.transpilerState,
      (transpilerState) => {
        transpilerStateRef.current = transpilerState;
      }
    );
  }, []);

  const handleSubmit = async () => {
    const state = transpilerStateRef.current;
    if (state.status === 'building' || state.status === 'initial') {
      addNotification({ message: 'Upload Failed: Transpilation Incomplete', type: 'error' });
      return;
    } else if (state.status === 'error') {
      addNotification({ message: 'Upload Failed: Transpilation Error', type: 'error' });
      return;
    } else if (!auth) {
      addNotification({ message: 'Login Required', type: 'error' });
      return;
    }

    const accessToken = auth.accessToken;
    const bundle = state.bundle;
    const createInstrumentPath = `${apiBaseUrl}/v1/instruments`;

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
          {!auth && (
            <p className="mb-3 text-sm font-medium">
              Please{' '}
              <button className="text-sky-700 hover:underline" type="button" onClick={onLoginRequired}>
                login to your account
              </button>{' '}
              to upload a bundle.
            </p>
          )}
          <Button disabled={!auth} type="button" onClick={() => void handleSubmit().then(() => setIsOpen(false))}>
            Upload
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
