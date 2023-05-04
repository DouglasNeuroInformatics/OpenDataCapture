import React from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { IdentificationForm, IdentificationFormData, PageHeader } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export const AddSubjectPage = () => {
  const { setActiveSubject } = useActiveSubjectStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('subjects');

  const handleSubmit = async (data: IdentificationFormData) => {
    const response = await axios.post('/v1/subjects', data, {
      validateStatus: (status) => status === 201 || status === 409
    });
    if (response.status === 409) {
      notifications.add({ type: 'error', message: t('addSubject.exists') });
      return;
    }
    setActiveSubject(data);
    notifications.add({ type: 'success' });
  };

  return (
    <div className="mx-auto max-w-screen-sm items-center">
      <PageHeader title={t('addSubject.pageTitle')} />
      <IdentificationForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddSubjectPage;
