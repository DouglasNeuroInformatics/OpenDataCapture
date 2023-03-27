import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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

export interface FooterProps {
  showDevInfo?: boolean;
}

export const Footer = ({ showDevInfo = DEV }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="py-4 text-slate-600">
      <div className="mb-3 flex justify-center gap-8">
        <a href={DOCS_URL} rel="noreferrer" target="_blank">
          Documentation
        </a>
        <a href={LICENSE_URL} rel="noreferrer" target="_blank">
          License
        </a>
        <a href={SOURCE_URL} rel="noreferrer" target="_blank">
          Source Code
        </a>
        <Link to="/contact">Contact</Link>
      </div>
      <p className="text-center text-sm text-slate-500">
        &copy; {CURRENT_YEAR} {t('organizationName')}
      </p>
      {showDevInfo && (
        <p className="text-center text-sm text-slate-500">{`Last Commit '${GIT_COMMIT!}' to Branch '${GIT_BRANCH!}' on ${GIT_COMMIT_DATE!}`}</p>
      )}
    </footer>
  );
};
