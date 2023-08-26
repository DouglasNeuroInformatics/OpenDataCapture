import React from 'react';

import { FormPageWrapper } from '@douglasneuroinformatics/ui';

import { SetupForm } from '../components/SetupForm';

import logo from '@/assets/logo.png';

export const SetupPage = () => {
  return (
    <FormPageWrapper languageOptions={['en', 'fr']} logo={logo} title="Setup">
      <SetupForm onSubmit={() => null} />
    </FormPageWrapper>
  );
};
