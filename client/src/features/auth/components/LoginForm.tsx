import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginCredentials, loginCredentialsSchema } from 'common';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AuthAPI } from '../api/auth.api';

import { Form } from '@/components/form';
import { useAuthStore } from '@/stores/auth-store';

export interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const auth = useAuthStore();
  const { t } = useTranslation();

  const { register, handleSubmit, formState } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema)
  });

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH) {
      void login({
        username: import.meta.env.VITE_DEV_USERNAME!,
        password: import.meta.env.VITE_DEV_PASSWORD!
      });
    }
  }, []);

  const { errors } = formState;

  const login = async (credentials: LoginCredentials) => {
    const { accessToken } = await AuthAPI.login(credentials);
    await auth.setAccessToken(accessToken);
    onSuccess();
  };

  return (
    <Form onSubmit={handleSubmit(login)}>
      <Form.TextField
        error={errors.username?.message}
        label={t('login.form.username')}
        name="username"
        register={register}
      />
      <Form.TextField
        error={errors.password?.message}
        label={t('login.form.password')}
        name="password"
        register={register}
        variant="password"
      />
      <Form.SubmitButton label={t('login.form.submitBtnLabel')} />
    </Form>
  );
};
