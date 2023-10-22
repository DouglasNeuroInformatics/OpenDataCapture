import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

import { AddVisitForm, type AddVisitFormData } from '../components/AddVisitForm';

export const AddVisit = () => {
  const { setActiveSubject } = useActiveSubjectStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('visits');

  const handleSubmit = async (data: AddVisitFormData) => {
    const response = await axios.post('/v1/subjects', data, {
      validateStatus: (status) => status === 201 || status === 409
    });
    if (response.status === 409) {
      notifications.addNotification({ message: t('addVisit.exists'), type: 'error' });
      return;
    }
    setActiveSubject(data);
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div className="mx-auto max-w-screen-sm items-center">
      <PageHeader title={t('addVisit.pageTitle')} />
      <AddVisitForm onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
