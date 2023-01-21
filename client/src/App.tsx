import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

import { Button, Notifications, Spinner } from '@/components/core';
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
      <h2 className="text-lg font-semibold">Ooops, something went wrong</h2>
      <Button className="mt-4" onClick={() => window.location.assign(window.location.origin)}>
        Refresh
      </Button>
    </div>
  );
};

const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} position="top-right" />
          <Notifications />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};

export default App;
