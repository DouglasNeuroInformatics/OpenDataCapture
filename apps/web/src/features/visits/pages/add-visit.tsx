import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { IdentificationForm, type IdentificationFormData, PageHeader } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const AddVisit = () => {
  const { setActiveSubject } = useActiveSubjectStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation();

  const handleSubmit = async (data: IdentificationFormData) => {
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
      <IdentificationForm onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
