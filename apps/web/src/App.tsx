import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/ui';
import { ErrorBoundary } from 'react-error-boundary';

import { ActiveVisit } from '@/components/ActiveVisit';
import { ErrorFallback } from '@/components/ErrorFallback';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { SetupProvider } from '@/features/setup';

import { Router } from './Router';
import './services/axios';
import './services/i18n';

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveVisit />
        <NotificationHub />
        <SetupProvider>
          <Router />
        </SetupProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
