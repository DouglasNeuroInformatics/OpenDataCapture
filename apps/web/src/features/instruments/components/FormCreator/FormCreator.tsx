import React, { useState } from 'react';

import { BaseFormField, PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { Stepper } from '@douglasneuroinformatics/ui';
import { FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { FieldsForm, FieldsFormData } from './FieldsForm';
import { InfoForm, InfoFormData } from './InfoForm';
import { Review } from './Review';

export type SimpleFormData = Record<string, PrimitiveFieldValue>;

export type SimpleForm<T extends SimpleFormData = SimpleFormData> = Omit<FormInstrument<T>, 'content'> & {
  content: Record<
    string,
    BaseFormField & {
      variant?: string;
    }
  >;
};

export const FormCreator = () => {
  const [state, setState] = useState<Partial<SimpleForm>>({
    kind: 'form',
    validationSchema: {
      type: 'object',
      required: []
    }
  });

  const { t } = useTranslation();

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
          label: t('instruments.createInstrument.steps.info'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <InfoForm onSubmit={handleSubmitDetails} />
        },
        {
          label: t('instruments.createInstrument.steps.fields'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <FieldsForm onSubmit={handleSubmitFields} />
        },
        {
          label: t('instruments.createInstrument.steps.review'),
          icon: <HiOutlineQuestionMarkCircle />,
          element: <Review form={state} />
        }
      ]}
    />
  );
};
