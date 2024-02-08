import React from 'react';

import { SuspenseFallback } from './SuspenseFallback';

export const SuspenseBoundary: React.FC<{ children: React.ReactNode }> = (props) => {
  return <React.Suspense fallback={<SuspenseFallback />}>{props.children}</React.Suspense>;
};
