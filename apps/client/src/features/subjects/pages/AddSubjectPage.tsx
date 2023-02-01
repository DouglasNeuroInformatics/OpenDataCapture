import React from 'react';

import { SubjectForm } from '../components/SubjectForm';

import { Divider } from '@/components/base';

export const AddSubjectPage = () => {
  return (
    <div className="flex flex-col items-center">
      <h1>Add Subject</h1>
      <Divider />
      <div style={{ width: 500 }}>
        <SubjectForm onSuccess={() => alert('Success')} />
      </div>
    </div>
  );
};
