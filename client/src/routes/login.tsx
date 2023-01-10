import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiUser } from 'react-icons/hi2';
import { ActionFunction, useActionData } from 'react-router-dom';

import logo from '@/assets/logo.png';
import Form from '@/components/Form';

const loginAction: ActionFunction = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());
  console.log('action!');
  return data;
};

const LoginPage = () => {
  const actionData = useActionData(); // AuthRequestDto | ValidationError | null | undefined;
  const { t } = useTranslation();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-500">
      <div className="flex flex-col items-center rounded-lg bg-white p-2">
        <img alt="logo" className="m-1 w-16" src={logo} />
        <h1 className="text-2xl font-bold">{t('login.pageTitle')}</h1>
        <Form>
          <Form.TextField label="Username" name="username" />
          <Form.SubmitButton label="Login" />
        </Form>
        <HiUser />
      </div>
    </div>
  );
};

export { LoginPage as default, loginAction };
