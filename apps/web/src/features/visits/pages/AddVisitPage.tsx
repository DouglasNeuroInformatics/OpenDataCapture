import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { type CreateVisitData, visitSchema } from '@open-data-capture/common/visit';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

import { AddVisitForm, type AddVisitFormData } from '../components/AddVisitForm';

export const AddVisitPage = () => {
  const { setActiveVisit } = useActiveVisitStore();
  const { currentGroup } = useAuthStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('visits');

  const handleSubmit = async ({ date, ...subjectIdData }: AddVisitFormData) => {
    const response = await axios.post('/v1/visits', {
      date,
      groupId: currentGroup?.id ?? null,
      subjectIdData
    } satisfies CreateVisitData);
    setActiveVisit(visitSchema.parse(response.data));
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div>
      <PageHeader title={t('addVisit')} />
      <AddVisitForm onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
