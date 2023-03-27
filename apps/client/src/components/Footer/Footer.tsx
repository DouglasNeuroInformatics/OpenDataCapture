import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaGithub, FaGlobe } from 'react-icons/fa';

const CURRENT_YEAR = new Date().getFullYear();

const DEV = import.meta.env.DEV;

const DOCS_URL = import.meta.env.VITE_DOCS_URL;
const LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
const SOURCE_URL = import.meta.env.DEV
  ? `${import.meta.env.VITE_GITHUB_REPO_URL}/tree/${import.meta.env.VITE_DEV_GIT_COMMIT!}`
  : import.meta.env.VITE_GITHUB_REPO_URL;
const GITHUB_ORG_URL = import.meta.env.VITE_GITHUB_ORG_URL;
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const ORG_WEBSITE = import.meta.env.VITE_ORG_WEBSITE;
const GIT_BRANCH = import.meta.env.VITE_DEV_GIT_BRANCH;
const GIT_COMMIT = import.meta.env.VITE_DEV_GIT_COMMIT?.slice(0, 7);
const GIT_COMMIT_DATE = import.meta.env.VITE_DEV_GIT_COMMIT_DATE;

export interface FooterProps {
  showDevInfo?: boolean;
  showOrgInfo?: boolean;
}

export const Footer = ({ showDevInfo = DEV, showOrgInfo = true }: FooterProps) => {
  const { t } = useTranslation();
  return (
    <footer className="flex flex-col gap-1">
      {showOrgInfo && (
        <div className="flex justify-center gap-5 text-lg">
          <a className="transition-transform hover:scale-125" href={GITHUB_ORG_URL} rel="noreferrer" target="_blank">
            <FaGithub />
          </a>
          <a className="transition-transform hover:scale-125" href={ORG_WEBSITE} rel="noreferrer" target="_blank">
            <FaGlobe />
          </a>
          <a
            className="transition-transform hover:scale-125"
            href={`mailto:${CONTACT_EMAIL}`}
            rel="noreferrer"
            target="_blank"
          >
            <FaEnvelope />
          </a>
        </div>
      )}
      <div className="flex justify-center gap-5 text-sm">
        <a href={DOCS_URL} rel="noreferrer" target="_blank">
          Documentation
        </a>
        <a href={LICENSE_URL} rel="noreferrer" target="_blank">
          License
        </a>
        <a href={SOURCE_URL} rel="noreferrer" target="_blank">
          Source Code
        </a>
      </div>
      <div className="mt-1 text-sm">
        <p className="text-center">
          &copy; {CURRENT_YEAR} {t('organizationName')}
        </p>
      </div>
      {showDevInfo && (
        <div className="flex justify-center text-sm">
          <span className="text-center">{`Last Commit '${GIT_COMMIT!}' to Branch '${GIT_BRANCH!}' on ${GIT_COMMIT_DATE!}`}</span>
        </div>
      )}
    </footer>
  );
};
