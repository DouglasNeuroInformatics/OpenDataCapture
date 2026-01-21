import React from 'react';

import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import { ErrorPage, LoadingPage } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

const IndexPage = React.lazy(() => import('./pages/IndexPage'));

export const App = () => {
  return (
    <React.Suspense
      fallback={
        <LoadingPage subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />
      }
    >
      <CoreProvider>
        <ErrorBoundary FallbackComponent={ErrorPage}>
          <IndexPage />
        </ErrorBoundary>
      </CoreProvider>
    </React.Suspense>
  );
};
