import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';

import { AddVisitForm, type AddVisitFormData } from '../components/AddVisitForm';

export const AddVisit = () => {
  const { setActiveVisit } = useActiveVisitStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('visits');

  const handleSubmit = async (data: AddVisitFormData) => {
    const response = await axios.post('/v1/subjects', data);
    setActiveVisit(data);
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div className="mx-auto max-w-screen-sm items-center">
      <PageHeader title={t('addVisit')} />
      <AddVisitForm onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
