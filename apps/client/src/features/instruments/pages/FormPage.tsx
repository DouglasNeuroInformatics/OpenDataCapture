import React, { useState } from 'react';

import { FormInstrument } from '@ddcp/common';
import { HiOutlineDocumentCheck, HiOutlinePrinter, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { FormOverview } from '../components/FormOverview';
import { FormQuestions } from '../components/FormQuestions';
import { FormSummary } from '../components/FormSummary';

import { FormValues, PageHeader, Spinner, Stepper } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useNotificationsStore } from '@/stores/notifications-store';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();

  const { data } = useFetch<FormInstrument>(`/instruments/forms/${params.id!}`);
  const [result, setResult] = useState<FormValues>();

  if (!data) {
    return <Spinner />;
  }

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
