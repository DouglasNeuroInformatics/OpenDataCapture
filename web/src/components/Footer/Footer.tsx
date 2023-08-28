import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageToggle } from '../LanguageToggle';

const CURRENT_YEAR = new Date().getFullYear();

const LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
const GITHUB_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL;

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="container py-3 text-slate-600 dark:text-slate-300 print:hidden">
      <hr className="my-4 border-slate-200 dark:border-slate-700 print:hidden" />
      <div className="mb-3 flex flex-col justify-center gap-4 lg:flex-row">
        <LanguageToggle className="lg:hidden" />
        <a className="text-center" href="/docs" rel="noreferrer" target="_blank">
          {t('footer.documentation')}
        </a>
        <a className="text-center" href={LICENSE_URL} rel="noreferrer" target="_blank">
          {t('footer.license')}
        </a>
        <a className="text-center" href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">
          {t('footer.sourceCode')}
        </a>
        <Link className="text-center" to="/contact">
          {t('footer.contact')}
        </Link>
      </div>
      <p className="text-center text-sm">
        &copy; {CURRENT_YEAR} {t('organization.name')}
      </p>
    </footer>
  );
};
