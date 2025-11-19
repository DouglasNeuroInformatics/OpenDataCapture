import { useEffect, useState } from 'react';

import { formatByteSize } from '@douglasneuroinformatics/libjs';
import { Button, Dialog } from '@douglasneuroinformatics/libui/components';

import { useAppStore } from '@/store';
export type StorageUsageDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const StorageUsageDialog = ({ isOpen, setIsOpen }: StorageUsageDialogProps) => {
  const [storageEstimate, setStorageEstimate] = useState<null | StorageEstimate>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [message, setMessage] = useState<null | string>('Loading...');

  const updateStorage = async () => {
    setMessage('Loading...');
    const [updated] = await Promise.all([
      await navigator.storage.estimate(),
      new Promise((resolve) => setTimeout(resolve, 500))
    ]);
    setStorageEstimate(updated);
    setMessage(null);
  };

  useEffect(() => {
    void updateStorage();
  }, [isOpen, updateKey]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Storage Usage</Dialog.Title>
          <Dialog.Description>
            Check the details below to see how much storage your browser is using for instruments and how much space is
            still available.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          {message ? (
            <p>{message}</p>
          ) : (
            <>
              <p>Usage: {storageEstimate?.usage ? formatByteSize(storageEstimate.usage, true) : 'N/A'}</p>
              <p>Quota: {storageEstimate?.quota ? formatByteSize(storageEstimate.quota, true) : 'N/A'} </p>
            </>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              useAppStore.persist.clearStorage();
              setMessage('Deleting...');
              void new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                setUpdateKey(updateKey + 1);
              });
            }}
          >
            Drop Database (Irreversible)
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
