import React, { useEffect } from 'react';

import { AuthPayload, FormInstrumentContent, loginCredentialsSchema } from '@douglasneuroinformatics/common';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components/Form';
import { useFingerprint } from '@/hooks/useFingerprint';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

type LoginFormData = {
  username: string;
  password: string;
};

export interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();
  const fingerprint = useFingerprint();
  const { t } = useTranslation(['auth', 'form']);

  const content: FormInstrumentContent<LoginFormData> = {
    username: {
      kind: 'text',
      label: t('auth:login.form.username'),
      variant: 'short'
    },
    password: {
      kind: 'text',
      label: t('auth:login.form.password'),
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
    const response = await axios.post<AuthPayload>(
      '/v1/auth/login',
      { ...credentials, fingerprint },
      {
        // Do not throw if unauthorized
        validateStatus: (status) => status === 200 || status === 401
      }
    );
    if (response.status === 401) {
      notifications.add({
        type: 'error',
        title: t('auth:login.form.unauthorizedError.title'),
        message: t('auth:login.form.unauthorizedError.message')
      });
      return;
    }
    auth.setAccessToken(response.data.accessToken);
    onSuccess();
  };

  return (
    <Form<LoginFormData>
      content={content}
      submitBtnLabel={t('auth:login.form.submit')}
      validationSchema={{
        ...loginCredentialsSchema,
        errorMessage: {
          properties: {
            username: t('form:errors.required'),
            password: t('form:errors.required')
          }
        }
      }}
      onSubmit={login}
    />
  );
};
