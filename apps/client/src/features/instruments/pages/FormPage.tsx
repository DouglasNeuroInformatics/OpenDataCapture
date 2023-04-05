import React, { useState } from 'react';

import { FormInstrument } from '@ddcp/common';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineDocumentCheck,
  HiOutlineIdentification,
  HiOutlinePrinter,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { FormIdentification } from '../components/FormIdentification';
import { FormOverview } from '../components/FormOverview';
import { FormQuestions } from '../components/FormQuestions';
import { FormSummary } from '../components/FormSummary';

import { FormValues, IdentificationFormData, PageHeader, Spinner, Stepper } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation();
  const { setActiveSubject } = useActiveSubjectStore();

  const { data } = useFetch<FormInstrument>(`/instruments/forms/${params.id!}`);
  const [result, setResult] = useState<FormValues>();

  if (!data) {
    return <Spinner />;
  }

  const handleSetSubject = (data: IdentificationFormData) => {
    setActiveSubject(data);
  };

  const handleSubmit = (data: FormValues) => {
    setResult(data);
    setTimeout(() => notifications.add({ message: 'Upload Successful', type: 'success' }), 1000);
  };

  return (
    <div>
      <PageHeader title={data.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={data.details} />,
            label: 'Overview',
            icon: <HiOutlineDocumentCheck />
          },
          {
            element: <FormIdentification onSubmit={handleSetSubject} />,
            label: 'Identification',
            icon: <HiOutlineIdentification />
          },
          {
            element: <FormQuestions instrument={data} onSubmit={handleSubmit} />,
            label: 'Questions',
            icon: <HiOutlineQuestionMarkCircle />
          },
          {
            element: <FormSummary instrument={data} result={result!} />,
            label: 'Summary',
            icon: <HiOutlinePrinter />
          }
        ]}
      />
    </div>
  );
};
