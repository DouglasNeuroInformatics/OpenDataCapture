import React from 'react';

import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Layout from '../components/Layout';

const HomePage = () => {
  const { t } = useTranslation('common');
  return (
    <Layout>
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="text-center w-75">
          <h1 className="display-5 fw-bold">{t('welcomeMessage')}</h1>
          <p className="lead mb-4">{t('description')}</p>
          <div>
            <Link className="btn btn-primary btn-lg" href="/add-patient">
              {t('addNewPatientMessage')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common']))
    }
  };
};

export default HomePage;
