import React from 'react';

import Form from '~/components/Form';
import Layout from '~/components/Layout';

const AddPatientPage = () => {
  return (
    <Layout>
      <h1 className='text-center py-4'>Add a New Patient</h1>
      <Form />
    </Layout>
  );
};

export default AddPatientPage;