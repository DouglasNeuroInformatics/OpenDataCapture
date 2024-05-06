import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
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
      date: date!, // default set in schema
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
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('startSession')}
        </Heading>
      </PageHeader>
      <StartSessionForm onSubmit={(data) => void handleSubmit(data)} />
    </React.Fragment>
  );
};
