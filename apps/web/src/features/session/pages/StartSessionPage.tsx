import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { StartSessionForm } from '../components/StartSessionForm';
import { useCreateSession } from '../hooks/useCreateSession';

export const StartSessionPage = () => {
  const startSession = useAppStore((store) => store.startSession);

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSession();

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('startSession')}
        </Heading>
      </PageHeader>
      <StartSessionForm
        onSubmit={async (data) => {
          const session = await createSessionMutation.mutateAsync(data);
          startSession(session);
        }}
      />
    </React.Fragment>
  );
};
