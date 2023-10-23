import { useState } from 'react';

import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Stepper, Spinner, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineDocumentCheck,
  HiOutlineIdentification,
  HiOutlinePrinter,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

import { FormIdentification } from '../components/FormIdentification';
import { FormOverview } from '../components/FormOverview';
import { FormQuestions } from '../components/FormQuestions';
import { FormSummary } from '../components/FormSummary';
import { useFetchInstrument } from '../hooks/useFetchInstrument';

export const FormPage = () => {
  const params = useParams();
  const notifications = useNotificationsStore();
  const { t } = useTranslation();
  const { activeVisit } = useActiveVisitStore();
  const { currentGroup } = useAuthStore();

  const instrument = useFetchInstrument(params.id!);

  const [result, setResult] = useState<FormInstrumentData>();
  const [timeCollected, setTimeCollected] = useState<number>(0);

  if (!instrument) {
    return <Spinner />;
  }

  const handleSubmit = async (data: FormInstrumentData) => {
    const now = Date.now();
    await axios.post('/v1/instruments/records/forms', {
      data: data,
      groupName: currentGroup?.name,
      instrumentName: instrument.name,
      instrumentVersion: instrument.version,
      kind: 'form',
      subjectInfo: activeVisit,
      time: Date.now()
    });
    setTimeCollected(now);
    setResult(data);
    notifications.addNotification({ message: t('instruments.formPage.uploadSuccessful'), type: 'success' });
  };

  return (
    <div>
      <PageHeader title={instrument.details.title} />
      <Stepper
        steps={[
          {
            element: <FormOverview details={instrument.details} />,
            icon: <HiOutlineDocumentCheck />,
            label: t('instruments.formPage.overview.label')
          },
          {
            element: <FormIdentification />,
            icon: <HiOutlineIdentification />,
            label: t('instruments.formPage.identification.label')
          },
          {
            element: <FormQuestions instrument={instrument} onSubmit={(data) => void handleSubmit(data)} />,
            icon: <HiOutlineQuestionMarkCircle />,
            label: t('instruments.formPage.questions.label')
          },
          {
            element: <FormSummary instrument={instrument} result={result} timeCollected={timeCollected} />,
            icon: <HiOutlinePrinter />,
            label: t('instruments.formPage.summary.label')
          }
        ]}
      />
    </div>
  );
};

export default FormPage;
