import React from 'react';

import { useTranslation } from 'react-i18next';
import { ActionFunction, useActionData } from 'react-router-dom';

const loginAction: ActionFunction = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());
  return data;
};

const LoginPage = () => {
  const actionData = useActionData(); // AuthRequestDto | ValidationError | null | undefined;
  const { t } = useTranslation();

  return (
    <div className="h-screen">
      <div className="container flex h-full flex-col items-center justify-center">
        <h1>{t('login.pageTitle')}</h1>
      </div>
    </div>
  );
};

export { LoginPage as default, loginAction };
