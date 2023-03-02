import React from 'react';

import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';

const currentYear = new Date().getFullYear();

const projectRepoLink = 'https://github.com/DouglasNeuroInformatics/DouglasDataCapturePlatform';

export interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
  const { t } = useTranslation();
  return (
    <footer className={clsx('@container/footer container mx-auto text-sm text-gray-500', className)}>
      <hr />
      <div className="w-full py-5">
        <p className="mb-1 text-center">
          &copy; {currentYear} {t('organizationName')}
        </p>
        <div className="@lg/footer:gap-3 flex flex-wrap items-center justify-center">
          {import.meta.env.DEV && (
            <>
              <span className="@lg/footer:w-auto w-full text-center">
                Branch: &apos;{import.meta.env.VITE_DEV_GIT_BRANCH}&apos;
              </span>
              <span className="@lg/footer:block hidden">|</span>
              <span className="@lg/footer:w-auto w-full text-center">
                Last Commit on {import.meta.env.VITE_DEV_GIT_COMMIT_DATE}: &apos;
                {import.meta.env.VITE_DEV_GIT_COMMIT?.slice(0, 7)}
              </span>
              <span className="@lg/footer:block hidden"> |</span>
            </>
          )}
          <a
            className="@lg/footer:w-auto flex w-full items-center justify-center"
            href={`${projectRepoLink}/tree/${import.meta.env.VITE_DEV_GIT_COMMIT!}`}
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
