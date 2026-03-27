import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type DeleteFileDialogProps = {
  filename: null | string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const DeleteFileDialog = ({ filename, isOpen, setIsOpen }: DeleteFileDialogProps) => {
  const deleteFile = useAppStore((store) => store.deleteFile);
  const { t } = useTranslation();
  return filename ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {t({
              en: `Are you sure you want to delete "${filename}"?`,
              fr: `Êtes-vous sûr de vouloir supprimer "${filename}" ?`
            })}
          </Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'Once deleted, this file cannot be restored',
              fr: 'Une fois supprimé, ce fichier ne peut plus être restauré'
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteFile(filename);
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
  ) : null;
};
