import React, { useState } from 'react';

import { DateUtils, FormInstrumentData } from '@douglasneuroinformatics/common';
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
import { useFetchInstrument } from '../hooks/useFetchInstrument';

import { PageHeader, Spinner, Stepper } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('instruments');
  const { activeSubject } = useActiveSubjectStore();
  const { currentGroup } = useAuthStore();

  const instrument = useFetchInstrument(params.id!);

  const [result, setResult] = useState<FormInstrumentData>();
  const [dateCollected, setDateCollected] = useState<Date>();

  if (!instrument) {
    return <Spinner />;
  }

  const handleSubmit = async (data: FormInstrumentData) => {
    const now = new Date();
    await axios.post('/v1/instruments/records/forms', {
      kind: 'form',
      dateCollected: DateUtils.toBasicISOString(now),
      instrumentName: instrument.name,
      instrumentVersion: instrument.version,
      groupName: currentGroup?.name,
      subjectInfo: activeSubject,
      data: data
    });
    setDateCollected(now);
    setResult(data);
    notifications.add({ message: t('formPage.uploadSuccessful'), type: 'success' });
  };

  return (
    <div>
      <PageHeader title={instrument.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={instrument.details} />,
            label: t('formPage.overview.label'),
            icon: <HiOutlineDocumentCheck />
          },
          {
            element: <FormIdentification />,
            label: t('formPage.identification.label'),
            icon: <HiOutlineIdentification />
          },
          {
            element: <FormQuestions instrument={instrument} onSubmit={handleSubmit} />,
            label: t('formPage.questions.label'),
            icon: <HiOutlineQuestionMarkCircle />
          },
          {
            element: <FormSummary dateCollected={dateCollected} instrument={instrument} result={result} />,
            label: t('formPage.summary.label'),
            icon: <HiOutlinePrinter />
          }
        ]}
      />
    </div>
  );
};

export default FormPage;
