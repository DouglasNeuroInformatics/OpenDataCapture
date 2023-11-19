import React from 'react';

import { ErrorFallback } from '@open-data-capture/react-core/components/ErrorFallback';
import { ErrorBoundary } from 'react-error-boundary';

import { SuspenseFallback } from './components/SuspenseFallback';
const Editor = React.lazy(() => import('./components/Editor').then((module) => ({ default: module.Editor })));

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Editor />
      </ErrorBoundary>
    </React.Suspense>
  );
};
