import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Router } from './Router';

import { ActiveSubject, NotificationHub } from '@/components';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';

import './services/18n';
import './services/axios';

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveSubject />
        <NotificationHub />
        <Router />
      </ErrorBoundary>
    </React.Suspense>
  );
};
