import React from 'react';

import { SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');

  const { data } = useFetch<SubjectFormRecords[]>(`/instruments/records/forms?subject=${params.subjectId!}`);

  if (!data) {
    return <Spinner />;
  }

  // const fieldNames = data.map((item) => item.instrument.content);

  // console.log(data.map(item => item.instrument._id));

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectId!.slice(0, 6)}`} />
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  );
};

export default SubjectPage;
