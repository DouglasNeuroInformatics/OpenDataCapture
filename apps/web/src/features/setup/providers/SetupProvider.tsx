import React, { useEffect } from 'react';

import type { SetupState } from '@opendatacapture/schemas/setup';

import { WithFallback } from '@/components/WithFallback';
import { useSetupState } from '@/hooks/useSetupState';

import { SetupPage } from '../pages/SetupPage';

export const SetupProvider = ({ children }: { children: React.ReactElement }) => {
  const setupStateQuery = useSetupState();

  useEffect(() => {
    if (setupStateQuery.data?.isSetup === false) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [setupStateQuery.data]);

  return (
    <WithFallback
      Component={({ data }: { data: SetupState }) => {
        if (data.isSetup !== false) {
          return children;
        }
        return <SetupPage />;
      }}
      props={{
        data: setupStateQuery.data
      }}
    />
  );
};
