import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { i18n } from '@opendatacapture/i18next';
import { ErrorPage } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

import { SuspenseFallback } from './components/SuspenseFallback';

const Editor = React.lazy(() => import('./components/Editor').then((module) => ({ default: module.Editor })));

await i18n.init();

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <NotificationHub />
        <Editor />
      </ErrorBoundary>
    </React.Suspense>
  );
};
