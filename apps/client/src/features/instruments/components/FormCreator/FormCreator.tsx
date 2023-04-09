import React, { useState } from 'react';

import { FormFields, FormInstrument, PrimitiveFieldValue } from '@ddcp/common';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { DetailsForm, DetailsFormData } from './DetailsForm';

import { Stepper } from '@/components';

export type SimpleFormData = Record<string, PrimitiveFieldValue>;

export interface SimpleForm<T extends SimpleFormData = SimpleFormData> extends FormInstrument<T> {
  content: FormFields<T>;
}

export const FormCreator = () => {
  const [state, setState] = useState<Partial<SimpleForm>>({
    kind: 'form'
  });

  const handleSubmitDetails = ({ tags, ...rest }: DetailsFormData) => {
    setState((prevState) => ({ ...prevState, ...rest, tags: tags.split(',').map((s) => s.trim()) }));
  };

  return (
    <Stepper
      steps={[
        {
          label: 'Details',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <DetailsForm onSubmit={handleSubmitDetails} />
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
