import React from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Form from '../components/Form';
import Layout from '../components/Layout';

const AddInstrumentsPage = () => {
  return (
    <Layout>
      <h1 className='text-center py-2'>Add Instrument</h1>
      <Form
        fields={[
          {
            name: 'name',
            label: 'Instrument Name',
            variant: 'text',
          }
        ]}
        onSubmit={() => {
          return new Promise(() => null)
        }}
      />
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

export default AddInstrumentsPage;
