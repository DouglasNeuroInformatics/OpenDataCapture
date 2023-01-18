import React from 'react';

import { SubjectForm } from '../components/SubjectForm';

export const AddSubjectPage = () => {
  return (
    <div className="flex flex-col items-center">
      <h1>Add Subject</h1>
      <div style={{ width: 500 }}>
        <SubjectForm onSuccess={() => alert('Success')} />
      </div>
    </div>
  );
};
