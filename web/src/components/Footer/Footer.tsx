import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageToggle } from '../LanguageToggle';

const CURRENT_YEAR = new Date().getFullYear();

const LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
const GITHUB_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL;
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

export type FooterProps = {
  isLogin?: boolean;
};

export const Footer = ({ isLogin = false }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="py-3 text-slate-600 print:hidden">
      {isLogin ? (
        <div className="flex items-center justify-center">
          <a className="text-sm" href={`mailto:${CONTACT_EMAIL}`}>
            {t('footer.contact')}
          </a>
          <span className="mx-1">|</span>
          <LanguageToggle className="text-sm" />
          <span className="mx-1">|</span>
          <a className="text-sm" href="/docs" rel="noreferrer" target="_blank">
            {t('footer.documentation')}
          </a>
        </div>
      ) : (
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
      )}
      <p className="text-center text-sm">
        &copy; {CURRENT_YEAR} {t('organization.name')}
      </p>
    </footer>
  );
};
