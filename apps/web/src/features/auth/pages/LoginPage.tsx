import { useEffect } from 'react';

import { FormPageWrapper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { AuthPayload, LoginCredentials } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import { useAuthStore } from '@/stores/auth-store';

import { DemoBanner } from '../components/DemoBanner';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const login = async (credentials: LoginCredentials) => {
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
    auth.setAccessToken(response.data.accessToken);
    navigate('/overview');
  };

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
      void login({
        password: import.meta.env.VITE_DEV_PASSWORD!,
        username: import.meta.env.VITE_DEV_USERNAME!
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <FormPageWrapper
        className="min-h-0 flex-grow"
        languageToggle={{
          dropdownDirection: 'up',
          options: ['en', 'fr']
        }}
        logo={logo}
        title={t('login')}
      >
        <LoginForm onSubmit={(credentials) => void login(credentials)} />
      </FormPageWrapper>
    </div>
  );
};

