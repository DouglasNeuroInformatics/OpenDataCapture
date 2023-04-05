import React, { useState } from 'react';

import { FormInstrument } from '@ddcp/common';
import axios from 'axios';
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

import { FormValues, PageHeader, Spinner, Stepper } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useNotificationsStore } from '@/stores/notifications-store';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation();

  const { data } = useFetch<FormInstrument>(`/instruments/forms/${params.id!}`);
  const [result, setResult] = useState<FormValues>();

  if (!data) {
    return <Spinner />;
  }

  const handleSubmit = async (data: FormValues) => {
    setResult(data);
    await axios.post('/instruments/records/forms', {
      kind: 'form',
      dateCollected: new Date(),
      instrumentId: params.id!,
    });
    notifications.add({ message: 'Upload Successful', type: 'success' });
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
            element: <FormIdentification />,
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
