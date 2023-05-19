import React from 'react';

import { Button } from '@douglasneuroinformatics/react-components';
import { useTranslation } from 'react-i18next';

import { useDisclaimerStore } from '../stores/disclaimer-store';

import { Modal } from '@/components';
import { useAuthStore } from '@/stores/auth-store';

export interface DisclaimerProps {
  isRequired: boolean;
}

export const Disclaimer = ({ isRequired = import.meta.env.PROD }: DisclaimerProps) => {
  const { currentUser, logout } = useAuthStore();
  const { isAccepted, username, setIsAccepted } = useDisclaimerStore();
  const { t } = useTranslation();

  const handleClose = () => setIsAccepted(true, currentUser!.username);

  const show = (!isAccepted || currentUser?.username !== username) && isRequired;

  return (
    <Modal open={show} title={t('disclaimer.title')} onClose={handleClose}>
      <p>{t('disclaimer.message')}</p>
      <div className="mt-3 flex">
        <Button className="mr-2" label={t('disclaimer.accept')} size="sm" onClick={handleClose} />
        <Button label={t('disclaimer.decline')} size="sm" variant="light" onClick={() => logout()} />
      </div>
    </Modal>
  );
};
