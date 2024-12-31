import React, { useEffect } from 'react';

import type { SetupState } from '@opendatacapture/schemas/setup';

import { WithFallback } from '@/components/WithFallback';
import { useSetupState } from '@/hooks/useSetupState';

import { useCreateSetupState } from '../hooks/useCreateSetupState';
import { SetupLoadingPage } from '../pages/SetupLoadingPage';
import { SetupPage } from '../pages/SetupPage';

export const SetupProvider = ({ children }: { children: React.ReactElement }) => {
  const setupStateQuery = useSetupState();
  const createSetupStateMutation = useCreateSetupState();

  useEffect(() => {
    if (setupStateQuery.data?.isSetup === false) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [setupStateQuery.data]);

  if (createSetupStateMutation.isPending) {
    return <SetupLoadingPage />;
  }

  return (
    <WithFallback
      Component={({ data }: { data: SetupState }) => {
        if (data.isSetup !== false) {
          return children;
        }
        return (
          <SetupPage
            onSubmit={({
              dummySubjectCount,
              enableExperimentalFeatures,
              firstName,
              initDemo,
              lastName,
              password,
              recordsPerSubject,
              username
            }) => {
              createSetupStateMutation.mutate({
                admin: {
                  firstName,
                  lastName,
                  password,
                  username
                },
                dummySubjectCount,
                enableExperimentalFeatures,
                initDemo,
                recordsPerSubject
              });
            }}
          />
        );
      }}
      props={{
        data: setupStateQuery.data
      }}
    />
  );
};
