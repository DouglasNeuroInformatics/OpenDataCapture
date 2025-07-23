import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type RestoreDefaultsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const RestoreDefaultsDialog = ({ isOpen, setIsOpen }: RestoreDefaultsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const resetInstruments = useAppStore((store) => store.resetInstruments);
  const resetSettings = useAppStore((store) => store.resetSettings);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Are you absolutely sure?</Dialog.Title>
          <Dialog.Description>
            This action will <span className="font-bold uppercase">delete all user-defined instruments</span> in local
            storage and restore the default configuration.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              resetInstruments();
              resetSettings();
              addNotification({ type: 'success' });
              setIsOpen(false);
            }}
          >
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
