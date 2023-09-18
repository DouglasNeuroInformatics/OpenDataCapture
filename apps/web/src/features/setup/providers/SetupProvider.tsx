import React, { useEffect, useState } from 'react';

import { FormPageWrapper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { SetupState } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { P, match } from 'ts-pattern';

import { type SetupData, SetupForm } from '../components/SetupForm';

import logo from '@/assets/logo.png';
import { Spinner } from '@/components';

const SETUP_KEY = 'DATA_CAPTURE_SETUP';

export const SetupProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const notifications = useNotificationsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [setupState, setSetupState] = useState<SetupState>(() => {
    const savedSetup = window.localStorage.getItem(SETUP_KEY);
    if (!savedSetup) {
      return { isSetup: null };
    }
    return JSON.parse(savedSetup) as SetupState;
  });

  const fetchSetupState = async () => {
    setIsLoading(true);
    const response = await axios.get<SetupState>('/v1/setup');
    setIsLoading(false);
    setSetupState(response.data);
  };

  const handleSubmit = async ({ username, password, initDemo }: SetupData) => {
    setIsLoading(true);
    await axios.post('/v1/setup', {
      admin: { username, password },
      initDemo
    });
    setIsLoading(false);
    setSetupState({ isSetup: true });
    notifications.addNotification({ type: 'success' });
  };

  useEffect(() => {
    if (setupState.isSetup === null) {
      fetchSetupState().catch(console.error);
    } else if (!setupState.isSetup) {
      window.history.replaceState({}, '', '/setup');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SETUP_KEY, JSON.stringify(setupState));
    if (setupState.isSetup === null) {
      fetchSetupState().catch(console.error);
    } else if (!setupState.isSetup) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [setupState]);

  return match({ ...setupState, isLoading })
    .with(P.union({ isLoading: true }, { isSetup: null }), () => (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    ))
    .with({ isSetup: false }, () => (
      <FormPageWrapper
        languageToggle={{
          dropdownDirection: 'up',
          options: ['en', 'fr']
        }}
        logo={logo}
        title={t('setup.pageTitle')}
        widthMultiplier={1.5}
      >
        <SetupForm onSubmit={(data) => void handleSubmit(data)} />
      </FormPageWrapper>
    ))
    .with({ isSetup: true }, () => children)
    .exhaustive();
};
