import React from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export const DisclaimerProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const logout = useAppStore((store) => store.logout);
  const isDisclaimerAccepted = useAppStore((store) => store.isDisclaimerAccepted);
  const setIsDisclaimerAccepted = useAppStore((store) => store.setIsDisclaimerAccepted);
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {children}
      <Dialog data-test-id="Disclaimer-dialog" open={isDisclaimerAccepted}>
        <Dialog.Content data-test-id="Disclaimer-dialog-content" onOpenAutoFocus={(event) => event.preventDefault()}>
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Disclaimer',
                fr: 'Avis'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'This platform is not an Electronic Health Record. Our terms of service prohibit using this platform as the primary mechanism to store clinical data.',
                fr: "Cette plateforme n'est pas un dossier médical électronique. Nos conditions de service interdisent l'utilisation de cette plateforme comme principal mécanisme de stockage des données cliniques."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button data-test-id="accept-disclaimer" type="button" onClick={() => setIsDisclaimerAccepted(true)}>
              {t({ en: 'Accept', fr: 'Accepter' })}
            </Button>
            <Button data-test-id="decline-disclaimer" type="button" variant="outline" onClick={logout}>
              {t({ en: 'Decline', fr: 'Refuser' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </React.Fragment>
  );
};
