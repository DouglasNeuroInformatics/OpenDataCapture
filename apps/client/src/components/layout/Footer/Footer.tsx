import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';

import { DevInfo } from './DevInfo';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="container mx-auto text-sm text-gray-500">
      <hr />
      <div className="p-5">
        <p className="text-center">
          &copy; {currentYear} {t('organizationName')}
        </p>
        <div className="flex items-center justify-center">
          {import.meta.env.DEV && <DevInfo />}
          <a
            className="flex items-center justify-center"
            href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform"
            rel="noreferrer"
            target="_blank"
          >
            <span className="text-center">{t('footer.viewSourceCode')}</span>
            <FaGithub className="ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};
