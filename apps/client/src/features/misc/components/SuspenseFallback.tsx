import React from 'react';

import { Spinner } from '@/components/core';

export const SuspenseFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <Spinner size="xl" />
  </div>
);
