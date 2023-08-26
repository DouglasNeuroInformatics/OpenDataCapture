import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/ui';
import { ErrorBoundary } from 'react-error-boundary';

import { Router } from './Router';

import { ActiveSubject } from '@/components';
import { SetupContextProvider } from '@/context/SetupContext';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';

import './services/i18n';
import './services/axios';

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SetupContextProvider>
          <ActiveSubject />
          <NotificationHub />
          <Router />
        </SetupContextProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
