import React from 'react';

import { useTranslation } from 'react-i18next';

import { useDisclaimerStore } from '../stores/disclaimer-store';

import { Button } from '@/components/base';
import { Modal } from '@/components/core';
import { useAuthStore } from '@/stores/auth-store';

export const Disclaimer = () => {
  const { currentUser, logout } = useAuthStore();
  const { isAccepted, username, setIsAccepted } = useDisclaimerStore();
  const { t } = useTranslation();

  const handleClose = () => setIsAccepted(true, currentUser!.username);

  return (
    <Modal
      open={!isAccepted || currentUser?.username !== username}
      title={t('home.disclaimer.title')}
      onClose={handleClose}
    >
      <p>{t('home.disclaimer.message')}</p>
      <div className="mt-3 flex">
        <Button className="mr-2" label={t('home.disclaimer.accept')} size="sm" onClick={handleClose} />
        <Button label={t('home.disclaimer.decline')} size="sm" variant="light" onClick={() => logout()} />
      </div>
    </Modal>
  );
};
