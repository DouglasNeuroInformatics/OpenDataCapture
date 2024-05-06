import React from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';

export const LoadingFallback = () => (
  <div className="flex h-full w-full flex-grow items-center justify-center">
    <Spinner />
  </div>
);
