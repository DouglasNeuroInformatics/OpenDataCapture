import React from 'react';

import type { GetStaticProps } from 'next';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const NotFoundPage = () => {
  const { t } = useTranslation('errors');
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="display-1">404</h1>
      <h2>{t('404')}</h2>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['errors']))
    }
  };
};

export default NotFoundPage;
