import React from 'react';

import { AlertDialog } from '@douglasneuroinformatics/libui/components';
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
      <AlertDialog open={!isDisclaimerAccepted}>
        <AlertDialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t({
                en: 'Disclaimer',
                fr: 'Avis'
              })}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t({
                en: 'This platform is not an Electronic Health Record. Our terms of service prohibit using this platform as the primary mechanism to store clinical data.',
                fr: "Cette plateforme n'est pas un dossier médical électronique. Nos conditions de service interdisent l'utilisation de cette plateforme comme principal mécanisme de stockage des données cliniques."
              })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Action onClick={() => setIsDisclaimerAccepted(true)}>
              {t({ en: 'Accept', fr: 'Accepter' })}
            </AlertDialog.Action>
            <AlertDialog.Cancel onClick={logout}>{t({ en: 'Decline', fr: 'Refuser' })}</AlertDialog.Cancel>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </React.Fragment>
  );
};
