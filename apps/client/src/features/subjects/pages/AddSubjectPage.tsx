import React from 'react';

import { useTranslation } from 'react-i18next';

import { SubjectsAPI } from '../api/subjects-api';

import { IdentificationForm, IdentificationFormData, PageHeader } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export const AddSubjectPage = () => {
  const { setActiveSubject } = useActiveSubjectStore();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('subjects');

  const handleSubmit = async (data: IdentificationFormData) => {
    await SubjectsAPI.addSubject(data);
    setActiveSubject(data);
    notifications.add({ type: 'success' });
  };

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col items-center">
      <PageHeader title={t('addSubject.pageTitle')} />
      <IdentificationForm onSubmit={handleSubmit} />
    </div>
  );
};
