import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="container mx-auto">
      <hr />
      <div className="p-5">
        <p className="text-center text-sm text-gray-500">
          &copy; {currentYear} {t('organizationName')}
        </p>
        <div className="flex items-center justify-center">
          <span className="text-center text-sm text-gray-500">{t('footer.viewSourceCode')}</span>
          <a
            href="https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform"
            rel="noreferrer"
            target="_blank"
          >
            <FaGithub className="ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
