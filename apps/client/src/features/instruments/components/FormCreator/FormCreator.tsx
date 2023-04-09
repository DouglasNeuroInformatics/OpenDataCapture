import React, { useState } from 'react';

import { BaseFormField, FormInstrument, PrimitiveFieldValue } from '@ddcp/common';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { FieldsForm, FieldsFormData } from './FieldsForm';
import { InfoForm, InfoFormData } from './InfoForm';
import { Review } from './Review';

import { Stepper } from '@/components';

export type SimpleFormData = Record<string, PrimitiveFieldValue>;

export type SimpleForm<T extends SimpleFormData = SimpleFormData> = Omit<FormInstrument<T>, 'content'> & {
  content: {
    [key: string]: BaseFormField;
  };
};

export const FormCreator = () => {
  const [state, setState] = useState<Partial<SimpleForm>>({
    kind: 'form'
  });

  const handleSubmitDetails = ({ name, tags, version, ...details }: InfoFormData) => {
    setState((prevState) => ({
      ...prevState,
      details,
      name,
      tags: tags.split(',').map((s) => s.trim()),
      version
    }));
  };

  const handleSubmitFields = ({ fields }: FieldsFormData) => {
    const content = Object.fromEntries(fields.map(({ name, ...rest }) => [name, rest]));
    setState((prevState) => ({
      ...prevState,
      content
    }));
  };

  return (
    <Stepper
      steps={[
        {
          label: 'Info',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <InfoForm onSubmit={handleSubmitDetails} />
        },
        {
          label: 'Fields',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <FieldsForm onSubmit={handleSubmitFields} />
        },
        {
          label: 'Review',
          icon: <HiOutlineQuestionMarkCircle />,
          element: <Review form={state} />
        }
      ]}
    />
  );
};
