import React, { useEffect } from 'react';

import { FormInstrumentContent, loginCredentialsSchema } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { AuthAPI } from '../api/auth-api';

import { Form } from '@/components/Form_2';
import { useAuthStore } from '@/stores/auth-store';

type LoginFormData = {
  username: string;
  password: string;
};

export interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const auth = useAuthStore();
  const { t } = useTranslation('auth');

  const content: FormInstrumentContent<LoginFormData> = {
    username: {
      kind: 'text',
      label: t('login.form.username'),
      variant: 'short'
    },
    password: {
      kind: 'text',
      label: t('login.form.password'),
      variant: 'password'
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH) {
      void login({
        username: import.meta.env.VITE_DEV_USERNAME!,
        password: import.meta.env.VITE_DEV_PASSWORD!
      });
    }
  }, []);

  const login = async (credentials: LoginFormData) => {
    const { accessToken } = await AuthAPI.login(credentials);
    auth.setAccessToken(accessToken);
    onSuccess();
  };

  return <Form<LoginFormData> content={content} validationSchema={loginCredentialsSchema} onSubmit={login} />;
};
