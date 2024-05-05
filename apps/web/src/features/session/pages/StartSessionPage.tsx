import React from 'react';

import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { StartSessionForm, type StartSessionFormData } from '../components/StartSessionForm';
import { useCreateSession } from '../hooks/useCreateSession';

export const StartSessionPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const startSession = useAppStore((store) => store.startSession);

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSession();

  const handleSubmit = async ({ date, ...subjectIdData }: StartSessionFormData) => {
    const session = await createSessionMutation.mutateAsync({
      date,
      groupId: currentGroup?.id ?? null,
      subjectIdData,
      type: 'IN_PERSON'
    });
    startSession({
      ...session,
      subject: { ...session.subject, firstName: subjectIdData.firstName, lastName: subjectIdData.lastName }
    });
  };

  return (
    <React.Fragment>
      <PageHeader title={t('startSession')} />
      <StartSessionForm onSubmit={(data) => void handleSubmit(data)} />
    </React.Fragment>
  );
};
