import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type RestoreDefaultsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const RestoreDefaultsDialog = ({ isOpen, setIsOpen }: RestoreDefaultsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const resetInstruments = useAppStore((store) => store.resetInstruments);
  const resetSettings = useAppStore((store) => store.resetSettings);
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Are you absolutely sure?', fr: 'Êtes-vous absolument sûr ?' })}</Dialog.Title>
          <Dialog.Description>
            {t({ en: 'This action will ', fr: 'Cette action va ' })}
            <span className="font-bold uppercase">
              {t({
                en: 'delete all user-defined instruments',
                fr: "supprimer tous les instruments définis par l'utilisateur"
              })}
            </span>{' '}
            {t({
              en: 'in local storage and restore the default configuration.',
              fr: 'dans le stockage local et restaurer la configuration par défaut.'
            })}
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
            {t({ en: 'Reset', fr: 'Réinitialiser' })}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            {t({ en: 'Cancel', fr: 'Annuler' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
