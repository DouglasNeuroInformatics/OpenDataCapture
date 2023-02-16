import React, { useEffect } from 'react';

import { JSONSchemaType } from 'ajv';

import { AuthAPI } from '../api/auth.api';

import { Form, FormFields } from '@/components/form';
import { useAuthStore } from '@/stores/auth-store';

type LoginFormData = {
  username: string;
  password: string;
};

const loginFormFields: FormFields<LoginFormData> = {
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
};

const loginFormSchema: JSONSchemaType<LoginFormData> = {
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
  required: ['username', 'password']
};

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
    await auth.setAccessToken(accessToken);
    onSuccess();
  };

  return <Form fields={loginFormFields} schema={loginFormSchema} onSubmit={login} />;
};
