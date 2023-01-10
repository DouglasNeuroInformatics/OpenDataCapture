import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';
import { ActionFunction, useActionData } from 'react-router-dom';
import { z } from 'zod';

import AuthAPI from '@/api/auth.api';
import logo from '@/assets/logo.png';
import Form from '@/components/Form';
import LanguageToggle from '@/components/LanguageToggle';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

type LoginError = z.inferFlattenedErrors<typeof loginSchema> | undefined;

const loginAction: ActionFunction = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());
  const result = loginSchema.safeParse(data);
  if (result.success) {
    const results = await AuthAPI.login(result.data);
    console.log('results', results);
    return null;
  }
  return result.error;
};

const LoginPage = () => {
  const formError = useActionData() as LoginError;
  const { t } = useTranslation();

  console.log(formError?.fieldErrors.password);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center rounded-lg bg-slate-50 p-8">
        <img alt="logo" className="m-1 w-16" src={logo} />
        <h1 className="text-2xl font-bold">{t('login.pageTitle')}</h1>
        <Form>
          <Form.TextField label={t('login.form.username')} name="username" />
          <Form.TextField label={t('login.form.password')} name="password" />
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
