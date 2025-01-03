import React, { useEffect } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import type { SetupState } from '@opendatacapture/schemas/setup';

import { WithFallback } from '@/components/WithFallback';
import { useSetupState } from '@/hooks/useSetupState';

import { SetupPage } from '../pages/SetupPage';

const Child: React.FC<{ children: React.ReactElement; data: SetupState }> = ({ children, data }) => {
  if (data.isSetup !== false) {
    return children;
  }
  return <SetupPage />;
};

export const SetupProvider = ({ children }: { children: React.ReactElement }) => {
  const setupStateQuery = useSetupState();

  // since there is no theme toggle on the page, this is required to set the document attribute
  useTheme();

  useEffect(() => {
    if (setupStateQuery.data?.isSetup === false) {
      window.history.replaceState({}, '', '/setup');
    }
  }, [setupStateQuery.data]);

  return (
    <WithFallback
      Component={Child}
      props={{
        children,
        data: setupStateQuery.data
      }}
    />
  );
};
