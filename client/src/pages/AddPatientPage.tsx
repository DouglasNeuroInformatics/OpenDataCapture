import React from 'react';

import { DemographicsForm } from '@/components/forms';
import Layout from '@/components/Layout';

const AddPatientPage = () => {
  return (
    <Layout>
      <h1 className="text-center py-2">Add a New Patient</h1>
      <hr className="py-2" />
      <DemographicsForm />
    </Layout>
  );
};

export default AddPatientPage;
