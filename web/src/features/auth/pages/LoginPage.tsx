import React from 'react';

import { FormPageWrapper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../components/LoginForm';

import logo from '@/assets/logo.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <FormPageWrapper
      languageToggle={{
        dropdownDirection: 'up',
        options: ['en', 'fr']
      }}
      logo={logo}
      title={t('login')}
    >
      <LoginForm
        onSuccess={() => {
          navigate('/overview');
        }}
      />
    </FormPageWrapper>
  );
};

export default LoginPage;
