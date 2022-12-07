import React from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HappinessQuestionnaireSchema } from 'schemas';

import API from '../api/API';
import Form from '../components/Form';
import Layout from '../components/Layout';

// VERY BAD TYPE ASSERTION - FIX THIS WHEN TIME TO REWRITE
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
            name: 'dateOfBirth',
            label: 'Date of Birth',
            variant: 'date'
          },
          {
            name: 'score',
            label: 'Happiness Today',
            variant: 'range'
          }
        ]}
        onSubmit={(values) => API.addHappinessScale(values as HappinessQuestionnaireSchema)}
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
