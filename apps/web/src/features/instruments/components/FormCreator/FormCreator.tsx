import { useState } from 'react';

import type { BaseFormField, PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { Stepper } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { FieldsForm, type FieldsFormData } from './FieldsForm';
import { InfoForm, type InfoFormData } from './InfoForm';
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
      required: [],
      type: 'object'
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
          element: <InfoForm onSubmit={handleSubmitDetails} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('instruments.createInstrument.steps.info')
        },
        {
          element: <FieldsForm onSubmit={handleSubmitFields} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('instruments.createInstrument.steps.fields')
        },
        {
          element: <Review form={state} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('instruments.createInstrument.steps.review')
        }
      ]}
    />
  );
};
