import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/ui';
import { ErrorBoundary } from 'react-error-boundary';

import { ActiveSubject } from '@/components';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';
import { SetupProvider } from '@/features/setup';

import { Router } from './Router';
import './services/axios';
import './services/i18n';

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveSubject />
        <NotificationHub />
        <SetupProvider>
          <Router />
        </SetupProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
