import React from 'react';

import { ErrorFallback } from '@opendatacapture/react-core';

export const MobileFallbackPage = () => (
  <ErrorFallback
    className="min-h-screen"
    description="We do not currently have the resources to maintain a mobile version of this site"
    subtitle="Mobile Devices Not Supported"
    title="This is Embarrassing"
  />
);
