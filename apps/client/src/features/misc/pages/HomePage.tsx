import React from 'react';

import { useTranslation } from 'react-i18next';

import { Disclaimer } from '../components/Disclaimer';

import { Button } from '@/components/base';

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Disclaimer />
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center">
        <div className="py-6 sm:py-10">
          <h1 className="whitespace-nowrap text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            {t('home.pageTitle')}
          </h1>
          <p className="mx-auto mt-5 text-lg text-slate-600 ">{t('home.platformDescription')}</p>
          <div className="my-5 flex">
            <Button className="mr-2" label="Get Started" />
            <Button label="Learn More" variant="light" />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
