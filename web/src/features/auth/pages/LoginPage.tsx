import React from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../components/LoginForm';

import { EntryPageWrapper } from '@/components/EntryPageWrapper';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <EntryPageWrapper title={t('login')}>
      <LoginForm
        onSuccess={() => {
          navigate('/overview');
        }}
      />
    </EntryPageWrapper>
  );
};

export default LoginPage;
