import React from 'react';

import { AlertDialog, Button } from '@douglasneuroinformatics/libui/components';

import { useAppStore } from '@/store';

export type DeleteFileDialogProps = {
  filename: null | string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteFileDialog = ({ filename, isOpen, setIsOpen }: DeleteFileDialogProps) => {
  const deleteFile = useAppStore((store) => store.deleteFile);
  return filename ? (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{`Are you sure you want to delete "${filename}"?`}</AlertDialog.Title>
          <AlertDialog.Description>Once deleted, this file cannot be restored</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteFile(filename);
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  ) : null;
};
