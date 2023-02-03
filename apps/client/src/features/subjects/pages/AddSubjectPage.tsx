import React from 'react';

import { SubjectForm } from '../components/SubjectForm';

import { Divider } from '@/components/base';
import { useNotificationsStore } from '@/stores/notifications-store';

export const AddSubjectPage = () => {
  const notifications = useNotificationsStore();
  return (
    <div className="flex flex-col items-center">
      <h1>Add Subject</h1>
      <Divider style={{ width: 500 }} />
      <div style={{ width: 500 }}>
        <SubjectForm onSuccess={() => notifications.add({ type: 'success' })} />
      </div>
    </div>
  );
};
