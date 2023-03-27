import React from 'react';

import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaGithub, FaGlobe } from 'react-icons/fa';

import { DevInfo } from './DevInfo';
import { IconLink } from './IconLink';

const currentYear = new Date().getFullYear();

export interface FooterProps {
  showDevInfo: boolean;
  docsURL: string;
  licenseURL: string;
  sourceURL: string;
  ghRepoURL: string;
  ghOrgURL: string;
  contactEmail: string;
  orgWebsite: string;
}

export const Footer = ({
  showDevInfo = import.meta.env.DEV,
  docsURL = import.meta.env.VITE_DOCS_URL,
  licenseURL = import.meta.env.VITE_LICENSE_URL,
  sourceURL = import.meta.env.DEV
    ? `${import.meta.env.VITE_GITHUB_REPO_URL}/tree/${import.meta.env.VITE_DEV_GIT_COMMIT!}`
    : import.meta.env.VITE_GITHUB_REPO_URL,
  ghOrgURL = import.meta.env.VITE_GITHUB_ORG_URL,
  contactEmail = import.meta.env.VITE_CONTACT_EMAIL,
  orgWebsite = import.meta.env.VITE_ORG_WEBSITE
}: FooterProps) => {
  const { t } = useTranslation();
  return (
    <footer>
      <div className="flex justify-center gap-5 text-lg">
        <IconLink href={ghOrgURL} icon={<FaGithub />} />
        <IconLink href={orgWebsite} icon={<FaGlobe />} />
        <IconLink href={`mailto:${contactEmail}`} icon={<FaEnvelope />} />
      </div>
      <div className="my-2 flex justify-center gap-5 text-sm">
        <a href={docsURL}>Documentation</a>
        <a href={licenseURL}>License</a>
        <a href={sourceURL}>Source Code</a>
      </div>
      {showDevInfo && <DevInfo />}
      <div className="text-sm">
        <p className="text-center">
          &copy; {currentYear} {t('organizationName')}
        </p>
      </div>
    </footer>
  );
};
