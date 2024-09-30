import React, { useEffect, useState } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { type Location, useLocation } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { StartSessionForm, type StartSessionFormData } from '../components/StartSessionForm';
import { useCreateSession } from '../hooks/useCreateSession';

export const StartSessionPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const startSession = useAppStore((store) => store.startSession);
  const [key, setKey] = useState(0);
  const location = useLocation() as Location<{
    initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  } | null>;

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSession();

  // this is to force reset the form when the session changes, if on the same page
  useEffect(() => {
    if (currentSession === null) {
      setKey(key + 1);
    }
  }, [currentSession]);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('startSession')}
        </Heading>
      </PageHeader>
      <StartSessionForm
        currentGroup={currentGroup}
        initialValues={
          location.state?.initialValues ?? {
            sessionType: 'IN_PERSON',
            subjectIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod ?? 'CUSTOM_ID'
          }
        }
        key={key}
        readOnly={currentSession !== null}
        onSubmit={async (data) => {
          const session = await createSessionMutation.mutateAsync(data);
          startSession(session);
        }}
      />
    </React.Fragment>
  );
};
