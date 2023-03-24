import React, { useEffect } from 'react';

import { loginCredentialsSchema } from '@ddcp/common';

import { AuthAPI } from '../api/auth-api';

import { Form, FormStructure } from '@/components/form';
import { useAuthStore } from '@/stores/auth-store';

type LoginFormData = {
  username: string;
  password: string;
};

const structure: FormStructure<LoginFormData> = [
  {
    fields: {
      username: {
        kind: 'text',
        label: 'Username',
        variant: 'short'
      },
      password: {
        kind: 'text',
        label: 'Password',
        variant: 'password'
      }
    }
  }
];

export interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const auth = useAuthStore();

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

  return <Form<LoginFormData> structure={structure} validationSchema={loginCredentialsSchema} onSubmit={login} />;
};
