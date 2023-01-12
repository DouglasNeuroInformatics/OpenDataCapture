import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginCredentials, loginCredentialsSchema } from 'common';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import Form from '@/components/Form';
import LanguageToggle from '@/components/LanguageToggle';
import useAuth from '@/hooks/useAuth';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginError, setLoginError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema)
  });

  const onSubmit = async (credentials: LoginCredentials) => {
    try {
      await auth.login(credentials);
      navigate('/home');
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    if (import.meta.env.VITE_DEV_BYPASS_AUTH) {
      void auth
        .login({
          username: import.meta.env.VITE_DEV_USERNAME!,
          password: import.meta.env.VITE_DEV_PASSWORD!
        })
        .then(() => navigate('/home'));
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 sm:bg-slate-100">
      <div className="flex w-full flex-col items-center rounded-lg bg-slate-50 p-8 sm:w-96">
        <img alt="logo" className="m-1 w-16" src={logo} />
        <h1 className="text-2xl font-bold">{t('login.pageTitle')}</h1>
        <Form error={loginError} onSubmit={handleSubmit(onSubmit)}>
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
        <div className="mt-3">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {t('organizationName')}
          </p>
          <div>
            <div className="mt-1 flex justify-center text-sm text-gray-500">
              <a
                className="flex items-center justify-center"
                href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform"
                rel="noreferrer"
                target="_blank"
              >
                {t('login.sourceCodeLinkLabel')}
                <FaGithub className="ml-1" />
              </a>
              <span className="mx-2">|</span>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginPage as default };
