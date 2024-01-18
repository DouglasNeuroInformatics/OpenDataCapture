import { useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Stepper } from '@douglasneuroinformatics/ui';
import { DocumentCheckIcon, PrinterIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';
import type { Promisable } from 'type-fest';

import { FormOverview } from './FormOverview';
import { FormQuestions } from './FormQuestions';
import { FormSummary } from './FormSummary';

type FormStepperProps = {
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => Promisable<void>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
};

const FormStepper = ({ form, onSubmit, subject }: FormStepperProps) => {
  const [data, setData] = useState<FormDataType>();
  const { t } = useTranslation('core');

  const handleSubmit = async (data: FormDataType) => {
    await onSubmit(data);
    setData(data);
  };

  return (
    <Stepper
      steps={[
        {
          element: <FormOverview form={form} />,
          icon: <DocumentCheckIcon />,
          label: t('steps.overview')
        },
        {
          element: <FormQuestions form={form} onSubmit={handleSubmit} />,
          icon: <QuestionMarkCircleIcon />,
          label: t('steps.questions')
        },
        {
          element: <FormSummary data={data!} form={form} subject={subject} timeCollected={Date.now()} />,
          icon: <PrinterIcon />,
          label: t('steps.summary')
        }
      ]}
    />
  );
};

export { FormStepper, type FormStepperProps };
