import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/stores/auth-store';

import { SubjectsTable } from '../components/SubjectsTable';
import { useSubjectsQuery } from '../hooks/useSubjectsQuery';

export const SubjectIndexPage = () => {
  const { currentGroup } = useAuthStore();
  const subjectsQuery = useSubjectsQuery({ params: { groupId: currentGroup?.id } });

  const { t } = useTranslation('subjects');

  return (
    <>
      <PageHeader title={t('index.title')} />
      <SubjectsTable data={subjectsQuery.data} />
    </>
  );
};
