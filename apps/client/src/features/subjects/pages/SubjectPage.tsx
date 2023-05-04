import React from 'react';

import { SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { RecordsGraph } from '../components/RecordsGraph';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const SubjectPage = () => {
  const params = useParams();
  const { i18n, t } = useTranslation('subjects');
  const { data } = useFetch<SubjectFormRecords[]>(
    `/v1/instruments/records/forms?subject=${params.subjectIdentifier!}&lang=${i18n.resolvedLanguage}`,
    [i18n.resolvedLanguage]
  );

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectIdentifier!.slice(0, 6)}`} />
      <RecordsGraph data={data} />
    </div>
  );
};

export default SubjectPage;
