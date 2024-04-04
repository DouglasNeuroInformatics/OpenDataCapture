import React from 'react';

import { LoadingPage } from '@opendatacapture/react-core';

export const SuspenseFallback = () => {
  return <LoadingPage subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />;
};
