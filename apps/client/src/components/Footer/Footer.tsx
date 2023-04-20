import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageToggle } from '../LanguageToggle';

const CURRENT_YEAR = new Date().getFullYear();

const DEV = import.meta.env.DEV;

const DOCS_URL = import.meta.env.VITE_DOCS_URL;
const LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
const SOURCE_URL = import.meta.env.DEV
  ? `${import.meta.env.VITE_GITHUB_REPO_URL}/tree/${import.meta.env.VITE_DEV_GIT_COMMIT!}`
  : import.meta.env.VITE_GITHUB_REPO_URL;
const GIT_BRANCH = import.meta.env.VITE_DEV_GIT_BRANCH;
const GIT_COMMIT = import.meta.env.VITE_DEV_GIT_COMMIT?.slice(0, 7);
const GIT_COMMIT_DATE = import.meta.env.VITE_DEV_GIT_COMMIT_DATE;
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

export interface FooterProps {
  isLogin?: boolean;
  showDevInfo?: boolean;
}

export const Footer = ({ isLogin = false, showDevInfo = DEV }: FooterProps) => {
  const { t } = useTranslation('common');

  return (
    <footer className="py-3 text-slate-600 print:hidden">
      {isLogin ? (
        <div className="flex items-center justify-center text-slate-500">
          <a className="text-sm" href={`mailto:${CONTACT_EMAIL}`}>
            {t('footer.contact')}
          </a>
          <span className="mx-1">|</span>
          <LanguageToggle className="text-sm" />
          <span className="mx-1">|</span>
          <a className="text-sm" href={DOCS_URL} rel="noreferrer" target="_blank">
            {t('footer.documentation')}
          </a>
        </div>
      ) : (
        <div className="mb-3 flex flex-col justify-center gap-4 lg:flex-row">
          <LanguageToggle className="lg:hidden" />
          <a className="text-center" href={DOCS_URL} rel="noreferrer" target="_blank">
            {t('footer.documentation')}
          </a>
          <a className="text-center" href={LICENSE_URL} rel="noreferrer" target="_blank">
            {t('footer.license')}
          </a>
          <a className="text-center" href={SOURCE_URL} rel="noreferrer" target="_blank">
            {t('footer.sourceCode')}
          </a>
          <Link className="text-center" to="/contact">
            {t('footer.contact')}
          </Link>
        </div>
      )}
      <p className="text-center text-sm text-slate-500">
        &copy; {CURRENT_YEAR} {t('organization.name')}
      </p>
      {showDevInfo && (
        <p className="text-center text-sm text-slate-500">{`Last Commit '${GIT_COMMIT!}' to Branch '${GIT_BRANCH!}' on ${GIT_COMMIT_DATE!}`}</p>
      )}
    </footer>
  );
};
