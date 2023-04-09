import React from 'react';

import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { DetailsForm } from './DetailsForm';

import { Stepper } from '@/components';

export const FormCreator = () => {
  return (
    <Stepper
      steps={[
        {
          label: 'Details',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <DetailsForm />
        },
        {
          label: 'Fields',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <span>Fields</span>
        }
      ]}
    />
  );
};
