import React from 'react';

import { useTranslation } from 'react-i18next';

import { FormInstrumentBuilder } from '../components/FormInstrumentBuilder';

import { PageHeader } from '@/components';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation('instruments');
  return (
    <div>
      <PageHeader title={t('createInstrument.pageTitle')} />
      <FormInstrumentBuilder />
    </div>
  );
};
