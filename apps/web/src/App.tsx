import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/ui';
import { ErrorBoundary } from 'react-error-boundary';

import { Router } from './Router';

import { ActiveSubject } from '@/components';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';
import { SetupProvider } from '@/features/setup';

import './services/i18n';
import './services/axios';

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
