import React from 'react';

import { AlertDialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '@/store';

import { useDisclaimerStore } from '../stores/disclaimer-store';

export type DisclaimerProps = {
  isRequired: boolean;
};

export const Disclaimer = ({ isRequired = import.meta.env.PROD }: DisclaimerProps) => {
  const currentUser = useAppStore((store) => store.currentUser);
  const logout = useAppStore((store) => store.logout);
  const { isAccepted, setIsAccepted, username } = useDisclaimerStore();

  const { t } = useTranslation('dashboard');

  return (
    <AlertDialog open={(!isAccepted || currentUser?.username !== username) && isRequired}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{t('disclaimer.title')}</AlertDialog.Title>
          <AlertDialog.Description>{t('disclaimer.message')}</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Action onClick={() => setIsAccepted(true, currentUser!.username)}>
            {t('disclaimer.accept')}
          </AlertDialog.Action>
          <AlertDialog.Cancel onClick={logout}>{t('disclaimer.decline')}</AlertDialog.Cancel>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
