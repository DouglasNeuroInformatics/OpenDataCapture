import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { ErrorPage } from '@opendatacapture/react-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

import { LoadingFallback } from '@/components/LoadingFallback';
import { SetupProvider } from '@/features/setup';
import { Routes } from '@/Routes';
import { queryClient } from '@/services/react-query';

import './services/axios';
import './services/i18n';
import './services/zod';

export const App = () => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <QueryClientProvider client={queryClient}>
          <NotificationHub />
          <SetupProvider>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </SetupProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
