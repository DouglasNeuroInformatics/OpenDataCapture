import React from 'react';

import { FormPageWrapper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { SetupForm } from '../components/SetupForm';

import logo from '@/assets/logo.png';

export const SetupPage = () => {
  const { t } = useTranslation();
  const notifications = useNotificationsStore();

  return (
    <FormPageWrapper
      languageToggle={{
        dropdownDirection: 'up',
        options: ['en', 'fr']
      }}
      logo={logo}
      title={t('setup.pageTitle')}
      widthMultiplier={1.5}
    >
      <SetupForm
        onSubmit={({ username, password, initDemo }) => {
          axios
            .post('/v1/setup', {
              admin: { username, password },
              initDemo
            })
            .then(() => {
              notifications.addNotification({ type: 'success' });
            })
            .catch(console.error);
        }}
      />
    </FormPageWrapper>
  );
};
