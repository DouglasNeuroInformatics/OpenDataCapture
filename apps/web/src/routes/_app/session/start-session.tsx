import React, { useEffect, useState } from 'react';

import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { $CreateSessionData, $StartSessionData } from '@opendatacapture/schemas/session';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';

import { PageHeader } from '@/components/PageHeader';
import { SessionInstrumentStep } from '@/components/SessionInstrumentStep';
import { StartSessionForm } from '@/components/StartSessionForm';
import type { StartSessionFormData } from '@/components/StartSessionForm';
import { useCreateSessionMutation } from '@/hooks/useCreateSessionMutation';
import { groupQueryOptions, useGroupQuery } from '@/hooks/useGroupQuery';
import { subjectCustomIdsQueryOptions, useSubjectCustomIdsQuery } from '@/hooks/useSubjectCustomIdsQuery';
import { useAppStore } from '@/store';

type PendingSession = {
  details: $CreateSessionData;
  sessionInstrumentId: string;
};

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
  const [pendingSession, setPendingSession] = useState<null | PendingSession>(null);

  const { t } = useTranslation('session');
  const createSessionMutation = useCreateSessionMutation();
  const subjectCustomIdsQuery = useSubjectCustomIdsQuery({ params: { groupId: currentGroup?.id } });
  // The store holds the group as it was at sign-in, so a session instrument chosen since is read fresh.
  const groupQuery = useGroupQuery(currentGroup?.id);

  const customSubjectIds = subjectCustomIdsQuery.data.map(removeSubjectIdScope);

  useEffect(() => {
    if (currentSession === null) {
      setInitialValues(defaultInitialValues);
    }
  }, [currentSession]);

  // The details name the group they were entered in, so they must not start a session after a switch.
  useEffect(() => {
    setPendingSession(null);
  }, [currentGroup?.id]);

  const createSession = async (data: $StartSessionData) => {
    const session = await createSessionMutation.mutateAsync(data);
    setPendingSession(null);
    startSession({ ...session, type: data.type });
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('startSession')}
        </Heading>
      </PageHeader>
      {currentSession === null && (
        // Kept mounted behind the session instrument, so going back finds the details as they were entered.
        <div className={pendingSession ? 'hidden' : undefined}>
          <StartSessionForm
            currentGroup={currentGroup}
            customSubjectIds={customSubjectIds}
            initialValues={initialValues}
            readOnly={currentSession !== null || createSessionMutation.isPending}
            username={currentUser?.username}
            onSubmit={async (details) => {
              const sessionInstrumentId = groupQuery.data?.settings.sessionInstrumentId;
              if (sessionInstrumentId) {
                setPendingSession({ details, sessionInstrumentId });
                return;
              }
              await createSession(details);
            }}
          />
        </div>
      )}
      {currentSession === null && pendingSession && (
        <SessionInstrumentStep
          instrumentId={pendingSession.sessionInstrumentId}
          onBack={() => setPendingSession(null)}
          onSubmit={async (result) => {
            const { details } = pendingSession;
            await createSession({
              ...details,
              // An in-person session is dated when it is created, which is now that its form is submitted.
              date: details.type === 'IN_PERSON' ? new Date() : details.date,
              sessionInstrumentAnswers: { data: result.data, instrumentId: result.instrumentId }
            });
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
                <svg
                  className="mb-3 size-10 text-green-900 dark:text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <motion.circle
                    animate={{ pathLength: 1 }}
                    cx="12"
                    cy="12"
                    initial={{ pathLength: 0 }}
                    r="10"
                    strokeLinecap="round"
                    transition={{ duration: 0.5 }}
                  />
                  <motion.path
                    animate={{ pathLength: 1 }}
                    d="M 7.5 12 L 10.5 15 L 16.5 8.5"
                    initial={{ pathLength: 0 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transition={{ delay: 0.5, duration: 0.4 }}
                  />
                </svg>
                <h5 className="font-semibold text-green-900 dark:text-green-500">
                  {t({
                    en: 'Session Successfully Started',
                    es: 'La sesión se inició correctamente',
                    fr: 'Session démarrée avec succès'
                  })}
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t({
                    en: 'Please note that you must end the current session before completing this form again.',
                    es: 'Tenga en cuenta que debe finalizar la sesión actual antes de volver a completar este formulario.',
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
  component: RouteComponent,
  loader: async ({ context }) => {
    const { currentGroup } = useAppStore.getState();
    await Promise.all([
      context.queryClient.ensureQueryData(subjectCustomIdsQueryOptions({ params: { groupId: currentGroup?.id } })),
      currentGroup ? context.queryClient.ensureQueryData(groupQueryOptions(currentGroup.id)) : null
    ]);
  }
});
