import React, { useState } from 'react';

import { DateUtils, FormInstrument } from '@ddcp/common';
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
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation();
  const { activeSubject } = useActiveSubjectStore();
  const { currentGroup } = useAuthStore();

  const { data: instrument } = useFetch<FormInstrument>(`/instruments/forms/${params.id!}`);
  const [result, setResult] = useState<FormValues>();

  if (!instrument) {
    return <Spinner />;
  }

  const handleSubmit = async (data: FormValues) => {
    await axios.post('/instruments/records/forms', {
      kind: 'form',
      dateCollected: DateUtils.toBasicISOString(new Date()),
      instrumentName: instrument.name,
      instrumentVersion: instrument.version,
      groupName: currentGroup?.name,
      subjectInfo: activeSubject,
      data: data
    });
    setResult(data);
    notifications.add({ message: 'Upload Successful', type: 'success' });
  };

  return (
    <div>
      <PageHeader title={instrument.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={instrument.details} />,
            label: 'Overview',
            icon: <HiOutlineDocumentCheck />
          },
          {
            element: <FormIdentification />,
            label: 'Identification',
            icon: <HiOutlineIdentification />
          },
          {
            element: <FormQuestions instrument={instrument} onSubmit={handleSubmit} />,
            label: 'Questions',
            icon: <HiOutlineQuestionMarkCircle />
          },
          {
            element: <FormSummary instrument={instrument} result={result} />,
            label: 'Summary',
            icon: <HiOutlinePrinter />
          }
        ]}
      />
    </div>
  );
};
