import React from 'react';

import { SuspenseFallback } from './components/SuspenseFallback';

const Editor = React.lazy(() => import('./components/Editor').then((module) => ({ default: module.Editor })));

export const App = () => {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <Editor />
    </React.Suspense>
  );
};
