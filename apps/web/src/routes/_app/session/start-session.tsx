import React, { useEffect, useState } from 'react';

import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';
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
      {currentSession === null && (
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
            className="flex grow"
            exit={{ opacity: 0, scale: 0.5 }}
            initial={{ opacity: 0, scale: 0.5 }}
            key="modal"
            transition={{ duration: 0.3 }}
          >
            <div className="flex grow items-center justify-center">
              <Card className="mx-auto flex max-w-2xl flex-col items-center p-12 opacity-70">
                <CheckCircle className="mb-3 !size-10 text-green-900 dark:text-green-500" />
                <h5 className="font-semibold text-green-900 dark:text-green-500">
                  {t({ en: 'Session Successfully Started', fr: 'Session démarrée avec succès' })}
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t({
                    en: 'Please note that you must end the current session before completing this form again.',
                    fr: 'Veuillez noter que vous devez mettre fin à la session en cours avant de remplir à nouveau ce formulaire.'
                  })}
                </p>
              </Card>
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
