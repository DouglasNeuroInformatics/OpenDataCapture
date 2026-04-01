import { useEffect, useState } from 'react';

import { formatByteSize } from '@douglasneuroinformatics/libjs';
import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export type StorageUsageDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const StorageUsageDialog = ({ isOpen, setIsOpen }: StorageUsageDialogProps) => {
  const [storageEstimate, setStorageEstimate] = useState<null | StorageEstimate>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const { t } = useTranslation();
  const [message, setMessage] = useState<null | string>(t({ en: 'Loading...', fr: 'Chargement...' }));

  const updateStorage = async () => {
    setMessage(t({ en: 'Loading...', fr: 'Chargement...' }));
    const [updated] = await Promise.all([
      navigator.storage.estimate(),
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
          <Dialog.Title>{t({ en: 'Storage Usage', fr: 'Utilisation du stockage' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'Check the details below to see how much storage your browser is using for instruments and how much space is still available.',
              fr: "Consultez les détails ci-dessous pour voir l'espace de stockage que votre navigateur utilise pour les instruments et combien d'espace est encore disponible."
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          {message ? (
            <p>{message}</p>
          ) : (
            <>
              <p>
                {t({ en: 'Usage: ', fr: 'Utilisation : ' })}
                {storageEstimate?.usage ? formatByteSize(storageEstimate.usage, true) : 'N/A'}
              </p>
              <p>
                {t({ en: 'Quota: ', fr: 'Quota : ' })}
                {storageEstimate?.quota ? formatByteSize(storageEstimate.quota, true) : 'N/A'}{' '}
              </p>
            </>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            variant="danger"
            onClick={() => {
              useAppStore.persist.clearStorage();
              setMessage(t({ en: 'Deleting...', fr: 'Suppression...' }));
              void new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                setUpdateKey(updateKey + 1);
              });
            }}
          >
            {t({ en: 'Drop Database (Irreversible)', fr: 'Supprimer la base de données (Irréversible)' })}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            {t({ en: 'Close', fr: 'Fermer' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
