import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

import { Button } from '@/components/base';
import { ActiveSubject, Notifications, Spinner } from '@/components/core';

import './services/axios';
import './services/18n';

const SuspenseFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <Spinner size="xl" />
  </div>
);

const ErrorFallback = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-red-500" role="alert">
      <h2 className="text-lg font-semibold">Uh oh, something went wrong</h2>
      <Button className="mt-4" label="Refresh" onClick={() => window.location.assign(window.location.origin)} />
    </div>
  );
};

const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ActiveSubject />
        <Notifications />
        <RouterProvider router={router} />
      </ErrorBoundary>
    </React.Suspense>
  );
};

export default App;
