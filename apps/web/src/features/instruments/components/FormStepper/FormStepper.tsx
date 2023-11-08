import { useEffect, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Stepper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { DocumentCheckIcon, PrinterIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import type { Visit } from '@open-data-capture/common/visit';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { FormOverview } from './FormOverview';
import { FormQuestions } from './FormQuestions';
import { FormSummary } from './FormSummary';

export type FormStepperProps = {
  activeVisit: Visit;
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => void;
};

export const FormStepper = ({ activeVisit, form }: FormStepperProps) => {
  const { currentGroup } = useAuthStore();
  const navigate = useNavigate();
  const notifications = useNotificationsStore();
  const [data, setData] = useState<FormDataType>();
  const { t } = useTranslation(['common', 'instruments']);

  useEffect(() => {
    if (!activeVisit) {
      navigate('/instruments/available-instruments');
    }
  }, [activeVisit]);

  const handleSubmit = async (data: FormDataType) => {
    await axios.post('/v1/instrument-records', {
      data,
      date: new Date(),
      groupId: currentGroup?.id,
      instrumentId: form.id,
      subjectIdentifier: activeVisit.subject.identifier
    });
    notifications.addNotification({ type: 'success' });
    setData(data);
  };

  return (
    <Stepper
      steps={[
        {
          element: <FormOverview form={form} />,
          icon: <DocumentCheckIcon />,
          label: t('instruments:form.steps.overview')
        },
        {
          element: <FormQuestions form={form} onSubmit={handleSubmit} />,
          icon: <QuestionMarkCircleIcon />,
          label: t('instruments:form.steps.questions')
        },
        {
          element: <FormSummary activeVisit={activeVisit} data={data!} form={form} timeCollected={Date.now()} />,
          icon: <PrinterIcon />,
          label: t('instruments:form.steps.summary')
        }
      ]}
    />
  );
};
