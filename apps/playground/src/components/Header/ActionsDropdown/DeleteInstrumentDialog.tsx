import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type DeleteInstrumentDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteInstrumentDialog = ({ isOpen, setIsOpen }: DeleteInstrumentDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const removeInstrument = useAppStore((store) => store.removeInstrument);
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Are you absolutely sure?</Dialog.Title>
          <Dialog.Description>This instrument will be deleted from local storage.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              removeInstrument(selectedInstrument.id);
              addNotification({ message: 'This instrument has been deleted', type: 'success' });
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
  );
};
