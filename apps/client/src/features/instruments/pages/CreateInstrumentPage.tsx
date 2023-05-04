import React from 'react';

import { useTranslation } from 'react-i18next';

import { FormCreator } from '../components/FormCreator';

import { PageHeader } from '@/components';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation('instruments');
  return (
    <div>
      <PageHeader title={t('createInstrument.pageTitle')} />
      <FormCreator />
    </div>
  );
};

export default CreateInstrumentPage;
