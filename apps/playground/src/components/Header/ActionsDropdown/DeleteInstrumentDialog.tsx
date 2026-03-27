import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type DeleteInstrumentDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteInstrumentDialog = ({ isOpen, setIsOpen }: DeleteInstrumentDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const removeInstrument = useAppStore((store) => store.removeInstrument);
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Are you absolutely sure?', fr: 'Êtes-vous absolument sûr ?' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'This instrument will be deleted from local storage.',
              fr: 'Cet instrument sera supprimé du stockage local.'
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              removeInstrument(selectedInstrument.id);
              addNotification({
                message: t({ en: 'This instrument has been deleted', fr: 'Cet instrument a été supprimé' }),
                type: 'success'
              });
              setIsOpen(false);
            }}
          >
            {t({ en: 'Delete', fr: 'Supprimer' })}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            {t({ en: 'Cancel', fr: 'Annuler' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
