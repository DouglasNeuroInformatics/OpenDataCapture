import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { useMediaQuery } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@opendatacapture/i18next';
import { ErrorPage, LoadingPage } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

import { MobileFallbackPage } from './components/MobileFallbackPage';
import { SourceRefProvider } from './context/SourceRefContext';

const IndexPage = React.lazy(() => import('./pages/IndexPage'));

await i18n.init();

export const App = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <React.Suspense
      fallback={
        <LoadingPage subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />
      }
    >
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <NotificationHub />
        {isDesktop ? (
          <SourceRefProvider>
            <IndexPage />
          </SourceRefProvider>
        ) : (
          <MobileFallbackPage />
        )}
      </ErrorBoundary>
    </React.Suspense>
  );
};
