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
      <div className="space-y-4">
        {currentSession == null && (
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
        )}
        {currentSession !== null && (
          <div className="mx-auto block max-h-fit max-w-3xl rounded-lg border border-gray-200 bg-white p-6 opacity-70 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="max-w-4xl text-center text-yellow-600 dark:text-yellow-300">
              {t({
                en: 'The current session must be ended before starting the form again.',
                fr: 'La session en cours doit être terminée avant de recommencer le formulaire.'
              })}
            </p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/session/start-session')({
  component: RouteComponent
});
