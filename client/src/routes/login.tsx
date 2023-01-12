import React, { useEffect, useState } from 'react';

import { LoginCredentials } from 'common';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';
import { ActionFunction, useActionData } from 'react-router-dom';
import { z } from 'zod';

import logo from '@/assets/logo.png';
import Form, { type FormErrors } from '@/components/Form';
import LanguageToggle from '@/components/LanguageToggle';
import useAuth from '@/hooks/useAuth';
import parseActionRequest, { ParsedActionRequest } from '@/utils/parseActionRequest';

const loginCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

type LoginActionData = ParsedActionRequest<LoginCredentials>;

const loginAction: ActionFunction = async ({ request }) => {
  return parseActionRequest(request, loginCredentialsSchema);
};

const LoginPage = () => {
  const actionData = useActionData() as LoginActionData | undefined;
  const auth = useAuth();
  const { t } = useTranslation();
  const [loginErrors, setLoginErrors] = useState<string[]>([]);

  const formErrors: FormErrors = {
    fields: actionData?.error?.fieldErrors,
    submission: [...(actionData?.error?.formErrors ?? []), ...loginErrors]
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    await auth.login(credentials).catch((error) => {
      if (error instanceof Error) {
        setLoginErrors([error.message]);
      }
    });
  };

  useEffect(() => {
    if (actionData?.data) {
      void handleLogin(actionData.data);
    }
  }, [actionData]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 sm:bg-slate-100">
      <div className="flex w-full flex-col items-center rounded-lg bg-slate-50 p-8 sm:w-96">
        <img alt="logo" className="m-1 w-16" src={logo} />
        <h1 className="text-2xl font-bold">{t('login.pageTitle')}</h1>
        <Form errors={formErrors}>
          <Form.TextField label={t('login.form.username')} name="username" />
          <Form.TextField label={t('login.form.password')} name="password" variant="password" />
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

export { LoginPage as default, loginAction };
