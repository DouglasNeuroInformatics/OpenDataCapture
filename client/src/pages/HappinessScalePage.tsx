import React from 'react';

import { HappinessForm } from '@/components/forms';
import Layout from '@/components/Layout';

const HappinessScalePage = () => {
  return (
    <Layout>
      <h1 className="text-center py-2">Submit the Happiness Questionnaire</h1>
      <hr className="py-2" />
      <HappinessForm />
    </Layout>
  );
};

export default HappinessScalePage;
