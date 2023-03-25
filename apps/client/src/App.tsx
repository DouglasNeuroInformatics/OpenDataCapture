import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { Router } from './router';

import { ActiveSubject, Notifications } from '@/components/core';
import { ErrorFallback, SuspenseFallback } from '@/features/misc';

import './services/axios';
import './services/18n';

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveSubject />
        <Notifications />
        <Router />
      </ErrorBoundary>
    </React.Suspense>
  );
};
