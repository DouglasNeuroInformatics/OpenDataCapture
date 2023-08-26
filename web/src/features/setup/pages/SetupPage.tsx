import React from 'react';

import { FormPageWrapper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { SetupForm } from '../components/SetupForm';

import logo from '@/assets/logo.png';

export const SetupPage = () => {
  const { t } = useTranslation();
  return (
    <FormPageWrapper
      languageToggle={{
        dropdownDirection: 'up',
        options: ['en', 'fr']
      }}
      logo={logo}
      title={t('setup.pageTitle')}
      widthMultiplier={1.5}
    >
      <SetupForm onSubmit={() => null} />
    </FormPageWrapper>
  );
};
