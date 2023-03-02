import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

import { Button } from '@/components/base';
import { ActiveSubject, Notifications, Spinner } from '@/components/core';
import { queryClient } from '@/services/react-query';

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
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools panelPosition="right" position="bottom-right" />
          <ActiveSubject />
          <Notifications />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};

export default App;
