import React, { useState } from 'react';

import { BaseFormField, FormInstrument, PrimitiveFieldValue } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { FieldsForm, FieldsFormData } from './FieldsForm';
import { InfoForm, InfoFormData } from './InfoForm';
import { Review } from './Review';

import { Stepper } from '@/components';

export type SimpleFormData = Record<string, PrimitiveFieldValue>;

export type SimpleForm<T extends SimpleFormData = SimpleFormData> = Omit<FormInstrument<T>, 'content'> & {
  content: {
    [key: string]: BaseFormField & {
      variant?: string;
    };
  };
};

export const FormCreator = () => {
  const [state, setState] = useState<Partial<SimpleForm>>({
    kind: 'form',
    validationSchema: {
      type: 'object',
      required: []
    }
  });

  const { t } = useTranslation('instruments');

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
          label: t('createInstrument.steps.info'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <InfoForm onSubmit={handleSubmitDetails} />
        },
        {
          label: t('createInstrument.steps.fields'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <FieldsForm onSubmit={handleSubmitFields} />
        },
        {
          label: t('createInstrument.steps.review'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <Review form={state} />
        }
      ]}
    />
  );
};
