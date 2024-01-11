import React, { useEffect } from 'react';

import { FormPageWrapper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import logo from '@/assets/logo.png';

import { SetupForm } from '../components/SetupForm';
import { SetupLoadingScreen } from '../components/SetupLoadingScreen';
import { useSetup } from '../hooks/useSetup';

export const SetupProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation('setup');

  const { mutation, query } = useSetup();

  useEffect(() => {
    if (query.data?.isSetup === false) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [query.data]);

  if (query.data?.isSetup !== false) {
    return children;
  } else if (mutation.isPending) {
    return <SetupLoadingScreen />;
  }

  return (
    <FormPageWrapper
      languageToggle={{
        dropdownDirection: 'up',
        options: ['en', 'fr']
      }}
      logo={logo}
      title={t('pageTitle')}
      widthMultiplier={1.5}
    >
      <SetupForm
        onSubmit={({ enableGateway, firstName, initDemo, lastName, password, username }) => {
          mutation.mutate({
            admin: {
              firstName,
              lastName,
              password,
              username
            },
            enableGateway,
            initDemo
          });
        }}
      />
    </FormPageWrapper>
  );
};
