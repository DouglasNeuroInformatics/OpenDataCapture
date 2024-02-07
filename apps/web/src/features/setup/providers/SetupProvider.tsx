import React, { useEffect } from 'react';

import { FormPageWrapper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import logo from '@/assets/logo.png';
import { useSetupState } from '@/hooks/useSetupState';

import { SetupForm } from '../components/SetupForm';
import { SetupLoadingScreen } from '../components/SetupLoadingScreen';
import { useInitApp } from '../hooks/useInitApp';

export const SetupProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n, t } = useTranslation('setup');
  const setupStateQuery = useSetupState();
  const initAppMutation = useInitApp();

  useEffect(() => {
    if (setupStateQuery.data?.isSetup === false) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [setupStateQuery.data]);

  if (setupStateQuery.data?.isSetup !== false) {
    return children;
  } else if (initAppMutation.isPending) {
    return <SetupLoadingScreen />;
  }

  return (
    <FormPageWrapper
      languageToggle={{
        dropdownDirection: 'up',
        i18n,
        options: ['en', 'fr']
      }}
      logo={logo}
      title={t('pageTitle')}
      widthMultiplier={1.5}
    >
      <SetupForm
        onSubmit={({ dummySubjectCount, firstName, initDemo, lastName, password, username }) => {
          initAppMutation.mutate({
            admin: {
              firstName,
              lastName,
              password,
              username
            },
            dummySubjectCount,
            initDemo
          });
        }}
      />
    </FormPageWrapper>
  );
};
