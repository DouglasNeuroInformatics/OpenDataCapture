import React, { useContext, useState } from 'react';

import { FormPageWrapper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { type SetupData, SetupForm } from '../components/SetupForm';

import logo from '@/assets/logo.png';
import { Spinner } from '@/components';
import { SetupContext } from '@/context/SetupContext';

export const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const notifications = useNotificationsStore();
  const { updateSetup } = useContext(SetupContext);

  const handleSubmit = async ({ username, password, initDemo }: SetupData) => {
    setIsLoading(true);
    try {
      await axios.post('/v1/setup', {
        admin: { username, password },
        initDemo
      });
      updateSetup({ isSetup: true });
      notifications.addNotification({ type: 'success' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      {isLoading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : (
        <SetupForm onSubmit={(data) => void handleSubmit(data)} />
      )}
    </FormPageWrapper>
  );
};
