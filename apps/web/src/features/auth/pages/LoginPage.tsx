import React, { useEffect } from 'react';

import { Card, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { Logo } from '@opendatacapture/react-core';
import type { AuthPayload, LoginCredentials } from '@opendatacapture/schemas/auth';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { config } from '@/config';
import { useSetupState } from '@/hooks/useSetupState';
import { useAppStore } from '@/store';

import { DemoBanner } from '../components/DemoBanner';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const login = useAppStore((store) => store.login);
  const notifications = useNotificationsStore();
  const navigate = useNavigate();
  const setupState = useSetupState();
  const { t } = useTranslation('auth');

  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
      // Do not throw if unauthorized
      validateStatus: (status) => status === 200 || status === 401
    });
    if (response.status === 401) {
      notifications.addNotification({
        message: t('unauthorizedError.message'),
        title: t('unauthorizedError.title'),
        type: 'error'
      });
      return;
    }
    login(response.data.accessToken);
    navigate('/overview');
  };

  useEffect(() => {
    if (import.meta.env.DEV && config.dev.isBypassAuthEnabled) {
      void handleLogin({
        password: config.dev.password!,
        username: config.dev.username!
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {setupState.data?.isDemo && <DemoBanner onLogin={(credentials) => void handleLogin(credentials)} />}
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <Card className="sm:bg-card w-full max-w-sm border-none bg-inherit px-3 py-2 sm:border-solid">
          <Card.Header className="flex items-center justify-center">
            <Logo className="m-2 h-auto w-16" variant="auto" />
            <Heading variant="h2">{t('login')}</Heading>
          </Card.Header>
          <Card.Content>
            <LoginForm onSubmit={(credentials) => void handleLogin(credentials)} />
          </Card.Content>
          <Card.Footer className="text-muted-foreground flex justify-between">
            <LanguageToggle
              align="start"
              options={{
                en: 'English',
                fr: 'Français'
              }}
              triggerClassName="border p-2"
              variant="ghost"
            />
            <ThemeToggle className="border p-2" variant="ghost" />
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};
