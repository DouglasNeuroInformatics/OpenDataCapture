import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { CreateVisitData, Visit } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';

import { AddVisitForm, type AddVisitFormData } from '../components/AddVisitForm';

export const AddVisit = () => {
  const { setActiveVisit } = useActiveVisitStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('visits');

  const handleSubmit = async ({ date, ...subjectIdData }: AddVisitFormData) => {
    const response = await axios.post<Visit>('/v1/visits', {
      date,
      subjectIdData
    } satisfies CreateVisitData);
    setActiveVisit(response.data);
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div>
      <PageHeader title={t('addVisit')} />
      <AddVisitForm onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
