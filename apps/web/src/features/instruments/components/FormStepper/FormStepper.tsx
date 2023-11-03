import { useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Stepper } from '@douglasneuroinformatics/ui';
import { DocumentCheckIcon, PrinterIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Visit } from '@open-data-capture/common/visit';
import { useTranslation } from 'react-i18next';

import { FormOverview } from './FormOverview';
import { FormQuestions } from './FormQuestions';
import { FormSummary } from './FormSummary';

export type FormStepperProps = {
  activeVisit: Visit;
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => void;
};

export const FormStepper = ({ activeVisit, form }: FormStepperProps) => {
  const [result, setResult] = useState<FormDataType>();
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Stepper
      steps={[
        {
          element: <FormOverview form={form} />,
          icon: <DocumentCheckIcon />,
          label: t('instruments:form.steps.overview')
        },
        {
          element: <FormQuestions form={form} onSubmit={setResult} />,
          icon: <QuestionMarkCircleIcon />,
          label: t('instruments:form.steps.questions')
        },
        {
          element: <FormSummary activeVisit={activeVisit} form={form} result={result!} timeCollected={Date.now()} />,
          icon: <PrinterIcon />,
          label: t('instruments:form.steps.summary')
        }
      ]}
    />
  );
};
