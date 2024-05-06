import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { config } from '@/config';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  const { t } = useTranslation('layout');

  return (
    <footer className="text-muted-foreground container py-3 text-sm">
      <hr className="my-3 border-slate-200 dark:border-slate-700" />
      <div className="flex items-center justify-center">
        <div className="mb-1 flex flex-row flex-wrap font-medium lg:flex-nowrap">
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center hover:underline lg:mx-2"
              href={config.meta.docsUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.documentation')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center hover:underline lg:mx-2"
              href={config.meta.licenseUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.license')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center hover:underline lg:mx-2"
              href={config.meta.githubRepoUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.sourceCode')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <Link className="underline-offset-3 p-1 text-center hover:underline lg:mx-2" to="/contact">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center">
        &copy; {CURRENT_YEAR} {t('organization.name')}
      </p>
    </footer>
  );
};
