import React, { useEffect } from 'react';

import { AuthPayload } from '@ddcp/types';
import { FormInstrumentContent } from '@douglasneuroinformatics/form-types';
import { Form, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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
  const notifications = useNotificationsStore();
  const { t } = useTranslation();

  const content: FormInstrumentContent<LoginFormData> = {
    username: {
      kind: 'text',
      label: t('username'),
      variant: 'short'
    },
    password: {
      kind: 'text',
      label: t('password'),
      variant: 'password'
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
      void login({
        username: import.meta.env.VITE_DEV_USERNAME!,
        password: import.meta.env.VITE_DEV_PASSWORD!
      });
    }
  }, []);

  const login = async (credentials: LoginFormData) => {
    const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
      // Do not throw if unauthorized
      validateStatus: (status) => status === 200 || status === 401
    });
    if (response.status === 401) {
      notifications.addNotification({
        type: 'error',
        title: t('unauthorizedError.title'),
        message: t('unauthorizedError.message')
      });
      return;
    }
    auth.setAccessToken(response.data.accessToken);
    onSuccess();
  };

  return (
    <Form<LoginFormData>
      content={content}
      submitBtnLabel={t('login')}
      validationSchema={{
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 1
          },
          password: {
            type: 'string',
            minLength: 1
          }
        },
        additionalProperties: false,
        required: ['username', 'password'],
        errorMessage: {
          properties: {
            username: t('form.errors.required'),
            password: t('form.errors.required')
          }
        }
      }}
      onSubmit={(credentials) => void login(credentials)}
    />
  );
};
