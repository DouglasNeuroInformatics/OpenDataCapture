import React, { useEffect, useState } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CheckCircle } from 'lucide-react';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';

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
      <AnimatePresence>
        {currentSession !== null && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            initial={{ opacity: 0, scale: 0 }}
            key="modal"
          >
            <div className="flex h-screen items-center justify-center">
              {currentSession !== null && (
                <div className="center mx-auto block max-w-3xl rounded-lg border border-gray-200 bg-white p-4 opacity-70 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <p className="flex max-w-4xl gap-x-3 text-center text-green-600 dark:text-green-300">
                    <span>
                      <CheckCircle />{' '}
                    </span>
                    {t({
                      en: 'The current session must be ended before starting the form again.',
                      fr: 'La session en cours doit être terminée avant de recommencer le formulaire.'
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/session/start-session')({
  component: RouteComponent
});
