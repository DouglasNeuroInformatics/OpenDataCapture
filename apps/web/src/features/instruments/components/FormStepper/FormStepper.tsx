import { useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Stepper } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import { HiOutlineDocumentCheck, HiOutlinePrinter, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { FormOverview } from './FormOverview';
import { FormQuestions } from './FormQuestions';
import { FormSummary } from './FormSummary';

export type FormStepperProps = {
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => void;
};

export const FormStepper = ({ form, onSubmit }: FormStepperProps) => {
  const [result, setResult] = useState<FormDataType>();
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Stepper
      steps={[
        {
          element: <FormOverview form={form} />,
          icon: <HiOutlineDocumentCheck />,
          label: t('instruments:form.steps.overview')
        },
        {
          element: <FormQuestions form={form} onSubmit={setResult} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('instruments:form.steps.questions')
        },
        {
          element: <FormSummary instrument={form} result={result} timeCollected={Date.now()} />,
          icon: <HiOutlinePrinter />,
          label: t('instruments:form.steps.summary')
        }
      ]}
    />
  );
};
