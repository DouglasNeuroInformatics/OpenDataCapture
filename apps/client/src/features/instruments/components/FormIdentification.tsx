import React, { useContext } from 'react';

import { IdentificationForm } from '@/components';
import { StepperContext } from '@/context/StepperContext';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const FormIdentification = () => {
  const { setActiveSubject } = useActiveSubjectStore();
  const { updateIndex } = useContext(StepperContext);

  return (
    <div>
      <IdentificationForm
        fillActiveSubject
        onSubmit={(data) => {
          setActiveSubject(data);
          updateIndex('increment');
        }}
      />
    </div>
  );
};
