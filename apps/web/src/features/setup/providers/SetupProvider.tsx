import React, { useEffect } from 'react';

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

  if (setupStateQuery.data?.isSetup !== false) {
    return children;
  } else if (createSetupStateMutation.isPending) {
    return <SetupLoadingPage />;
  }

  return (
    <SetupPage
      onSubmit={({ dummySubjectCount, firstName, initDemo, lastName, password, recordsPerSubject, username }) => {
        createSetupStateMutation.mutate({
          admin: {
            email: 'admin@opendatacapture.org',
            firstName,
            lastName,
            password,
            username
          },
          dummySubjectCount,
          initDemo,
          recordsPerSubject
        });
      }}
    />
  );
};
