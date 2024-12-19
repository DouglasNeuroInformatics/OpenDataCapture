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
  const location = useLocation() as Location<{
    initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  } | null>;
  const defaultInitialValues = {
    sessionType: 'IN_PERSON',
    subjectIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod ?? 'CUSTOM_ID'
  } as const;
  const [initialValues, setInitialValues] = useState<FormTypes.PartialNullableData<StartSessionFormData>>(
    location.state?.initialValues ?? defaultInitialValues
  );

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSession();

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
        readOnly={currentSession !== null}
        onSubmit={async (formData) => {
          const session = await createSessionMutation.mutateAsync(formData);
          startSession({ ...session, type: formData.type });
        }}
      />
    </React.Fragment>
  );
};
