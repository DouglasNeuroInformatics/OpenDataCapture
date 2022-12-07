import React from 'react';

import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SubjectSchema } from 'schemas';

import API from '../api/API';
import Form, { type FormField } from '../components/Form';
import Layout from '../components/Layout';

const demographicsFields: FormField[] = [
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
  }
];

// VERY BAD TYPE ASSERTION - FIX THIS WHEN TIME TO REWRITE
const AddSubjectPage = () => {
  return (
    <Layout>
      <h1 className="text-center py-2">Add Subject</h1>
      <Form fields={demographicsFields} onSubmit={(values) => API.addSubject(values as SubjectSchema)} />
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

export default AddSubjectPage;
