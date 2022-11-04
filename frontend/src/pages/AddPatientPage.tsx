import React from 'react';

import DemographicsForm from '~/components/DemographicsForm';
import Layout from '~/components/Layout';

const AddPatientPage = () => {
  return (
    <Layout>
      <h1 className='text-center py-4'>Add a New Patient</h1>
      <DemographicsForm />
    </Layout>
  );
};

export default AddPatientPage;