import { Button, Dialog } from '@douglasneuroinformatics/libui/components';

import { useAppStore } from '@/store';

export type DeleteFileDialogProps = {
  filename: null | string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteFileDialog = ({ filename, isOpen, setIsOpen }: DeleteFileDialogProps) => {
  const deleteFile = useAppStore((store) => store.deleteFile);
  return filename ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{`Are you sure you want to delete "${filename}"?`}</Dialog.Title>
          <Dialog.Description>Once deleted, this file cannot be restored</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteFile(filename);
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ) : null;
};
