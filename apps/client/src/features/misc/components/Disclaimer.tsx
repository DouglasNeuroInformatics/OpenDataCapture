import React from 'react';

import { useTranslation } from 'react-i18next';

import { useDisclaimerStore } from '../stores/disclaimer-store';

import { Button, Modal } from '@/components';
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
    <Modal open={show} title={t('home.disclaimer.title')} onClose={handleClose}>
      <p>{t('home.disclaimer.message')}</p>
      <div className="mt-3 flex">
        <Button className="mr-2" label={t('home.disclaimer.accept')} size="sm" onClick={handleClose} />
        <Button label={t('home.disclaimer.decline')} size="sm" variant="light" onClick={() => logout()} />
      </div>
    </Modal>
  );
};
