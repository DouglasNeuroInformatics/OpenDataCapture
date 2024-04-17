import React from 'react';

import { AlertDialog, Button } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';

import { useInstrumentStore } from '@/store/instrument.store';

export type DeleteInstrumentDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteInstrumentDialog = ({ isOpen, setIsOpen }: DeleteInstrumentDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const defaultInstrument = useInstrumentStore((store) => store.defaultInstrument);
  const removeInstrument = useInstrumentStore((store) => store.removeInstrument);
  const selectedInstrument = useInstrumentStore((store) => store.selectedInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
              addNotification({ message: 'This instrument has been deleted', type: 'success' });
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
