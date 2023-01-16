import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../components/LoginForm';

import logo from '@/assets/logo.png';
import { LanguageToggle } from '@/components/core';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 sm:bg-slate-100">
      <div className="flex w-full flex-col items-center rounded-lg bg-slate-50 p-8 sm:w-96">
        <img alt="logo" className="m-1 w-16" src={logo} />
        <h1 className="text-2xl font-bold">{t('login.pageTitle')}</h1>
        <div className="mt-3">
          <LoginForm onSuccess={() => navigate('/home')} />
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
