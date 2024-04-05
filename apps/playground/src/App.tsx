import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { i18n } from '@opendatacapture/i18next';
import { ErrorPage, LoadingPage } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

const Editor = React.lazy(() => import('./components/Editor').then((module) => ({ default: module.Editor })));

await i18n.init();

export const App = () => {
  return (
    <React.Suspense
      fallback={
        <LoadingPage subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />
      }
    >
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <NotificationHub />
        <Editor />
      </ErrorBoundary>
    </React.Suspense>
  );
};
