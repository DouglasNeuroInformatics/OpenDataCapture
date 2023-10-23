import type { Subject } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/Spinner';
import { useFetch } from '@/hooks/useFetch';

import { SubjectsTable } from '../components/SubjectsTable';

export const IndexPage = () => {
  const { data } = useFetch<Subject[]>('/v1/subjects');
  const { t } = useTranslation('subjects');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={t('index.title')} />
      <SubjectsTable data={data} />
    </div>
  );
};
