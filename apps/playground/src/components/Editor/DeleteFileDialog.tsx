import React from 'react';

import { AlertDialog, Button } from '@douglasneuroinformatics/libui/components';

import type { EditorFile } from '@/models/editor-file.model';
import { useEditorStore } from '@/store/editor.store';

export type DeleteFileDialogProps = {
  file: EditorFile | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteFileDialog = ({ file, isOpen, setIsOpen }: DeleteFileDialogProps) => {
  const deleteFile = useEditorStore((store) => store.deleteFile);
  return file ? (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{`Are you sure you want to delete "${file.name}"?`}</AlertDialog.Title>
          <AlertDialog.Description>Once deleted, this file cannot be restored</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteFile(file);
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
