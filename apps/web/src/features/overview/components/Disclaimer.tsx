import React from 'react';

import { Button, LegacyModal } from '@douglasneuroinformatics/libui/components';
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
  const { t } = useTranslation('overview');

  const handleClose = () => {
    setIsAccepted(true, currentUser!.username);
  };

  const show = (!isAccepted || currentUser?.username !== username) && isRequired;

  return (
    <LegacyModal open={show} title={t('disclaimer.title')} onClose={handleClose}>
      <p className="text-sm">{t('disclaimer.message')}</p>
      <div className="mt-3 flex">
        <Button className="mr-2" label={t('disclaimer.accept')} size="sm" onClick={handleClose} />
        <Button
          label={t('disclaimer.decline')}
          size="sm"
          variant="secondary"
          onClick={() => {
            logout();
          }}
        />
      </div>
    </LegacyModal>
  );
};
