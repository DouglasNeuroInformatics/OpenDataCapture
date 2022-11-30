import React from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import API from '../api/API';
import Form from '../components/Form';
import Layout from '../components/Layout';

const HappinessScalePage = () => {
  return (
    <Layout>
      <h1 className="text-center py-2">Submit the Happiness Scale</h1>
      <Form
        fields={[
          {
            name: 'firstName',
            label: 'First Name',
            variant: 'text'
          },
          {
            name: 'lastName',
            label: 'Last Name',
            variant: 'text'
          },
          {
            name: 'sex',
            label: 'Sex',
            variant: 'select',
            options: {
              Male: 'male',
              Female: 'female'
            }
          },
          {
            name: 'dateOfBirth',
            label: 'Date of Birth',
            variant: 'date'
          },
          {
            name: 'score',
            label: 'Happiness Today',
            variant: 'text'
          }
        ]}
        onSubmit={(values) => API.addHappinessScale(values)}
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

export default HappinessScalePage;
