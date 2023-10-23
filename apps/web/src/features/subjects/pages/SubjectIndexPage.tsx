import type { Subject } from '@open-data-capture/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/stores/auth-store';

import { SubjectsTable } from '../components/SubjectsTable';

export const SubjectIndexPage = () => {
  const { currentGroup } = useAuthStore();
  const query = useQuery({
    queryFn: () => axios.get<Subject[]>('/v1/subjects').then((response) => response.data),
    queryKey: ['subjects', currentGroup?.id]
  });

  const { t } = useTranslation('subjects');

  if (!query.data) {
    return null;
  }

  return (
    <div>
      <PageHeader title={t('index.title')} />
      <SubjectsTable data={query.data} />
    </div>
  );
};
