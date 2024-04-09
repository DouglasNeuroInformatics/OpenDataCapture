import React from 'react';

import { useTranslation } from 'react-i18next';

export type MobileBlockerProps = {
  children: React.ReactNode;
};

export const MobileBlocker = ({ children }: MobileBlockerProps) => {
  const { t } = useTranslation('core');
  return (
    <div className="h-full w-full">
      <div className="mx-auto flex h-full w-full max-w-prose flex-col items-center justify-center px-2 py-8 text-center md:hidden">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('mobileBlocker.title')}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">{t('mobileBlocker.subtitle')}</p>
      </div>
      <div className="hidden h-full w-full md:block">{children}</div>
    </div>
  );
};
