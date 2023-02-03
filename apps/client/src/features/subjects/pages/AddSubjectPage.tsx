import React from 'react';

import { SubjectForm } from '../components/SubjectForm';

import { PageHeader } from '@/components/core';
import { useNotificationsStore } from '@/stores/notifications-store';

export const AddSubjectPage = () => {
  const notifications = useNotificationsStore();
  return (
    <div className="mx-auto flex max-w-screen-sm flex-col items-center">
      <PageHeader title="Add Subject" />
      <SubjectForm onSuccess={() => notifications.add({ type: 'success' })} />
    </div>
  );
};
