import React, { useEffect, useState } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { createFileRoute, useLocation } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { StartSessionForm } from '@/components/StartSessionForm';
import type { StartSessionFormData } from '@/components/StartSessionForm';
import { useCreateSessionMutation } from '@/hooks/useCreateSessionMutation';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const startSession = useAppStore((store) => store.startSession);
  const currentUser = useAppStore((store) => store.currentUser);
  const location = useLocation();
  const defaultInitialValues = {
    sessionType: 'IN_PERSON',
    subjectIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod ?? 'CUSTOM_ID'
  } as const;
  const [initialValues, setInitialValues] = useState<FormTypes.PartialNullableData<StartSessionFormData>>(
    location.state?.initialValues ?? defaultInitialValues
  );

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSessionMutation();

  useEffect(() => {
    if (currentSession === null) {
      setInitialValues(defaultInitialValues);
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
        initialValues={initialValues}
        readOnly={currentSession !== null || createSessionMutation.isPending}
        username={currentUser?.username}
        onSubmit={async (formData) => {
          const session = await createSessionMutation.mutateAsync(formData);
          startSession({ ...session, type: formData.type });
        }}
      />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/session/start-session')({
  component: RouteComponent
});
