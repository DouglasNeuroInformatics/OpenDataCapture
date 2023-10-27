import { useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Spinner, Stepper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { HiOutlineDocumentCheck, HiOutlinePrinter, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

import { FormOverview } from '../components/FormOverview';
import { FormQuestions } from '../components/FormQuestions';
import { FormSummary } from '../components/FormSummary';
import { useFormQuery } from '../hooks/useFormQuery';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation(['common', 'instruments']);
  const { activeVisit } = useActiveVisitStore();
  const { currentGroup } = useAuthStore();

  const query = useFormQuery(params.id!);

  const [result, setResult] = useState<FormDataType>();
  const [timeCollected, setTimeCollected] = useState<number>(0);

  if (!query.data) {
    return <Spinner />;
  }

  const form = query.data;

  const handleSubmit = async (data: FormDataType) => {
    const now = Date.now();
    await axios.post('/v1/instruments/records/forms', {
      data: data,
      groupName: currentGroup?.name,
      kind: 'form',
      subjectInfo: activeVisit,
      time: Date.now()
    });
    setTimeCollected(now);
    setResult(data);
    notifications.addNotification({ message: t('uploadSuccessful'), type: 'success' });
  };

  return (
    <div>
      <PageHeader title={form.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={form.details} />,
            icon: <HiOutlineDocumentCheck />,
            label: t('instruments:form.steps.overview')
          },
          {
            element: <FormQuestions instrument={form} onSubmit={(data) => void handleSubmit(data)} />,
            icon: <HiOutlineQuestionMarkCircle />,
            label: t('instruments:form.steps.questions')
          },
          {
            element: <FormSummary instrument={form} result={result} timeCollected={timeCollected} />,
            icon: <HiOutlinePrinter />,
            label: t('instruments:form.steps.summary')
          }
        ]}
      />
    </div>
  );
};
