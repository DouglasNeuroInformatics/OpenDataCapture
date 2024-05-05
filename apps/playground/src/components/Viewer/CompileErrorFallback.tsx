import React from 'react';

import { ViewerErrorFallback, type ViewerErrorFallbackProps } from './ViewerErrorFallback';

export const CompileErrorFallback = (props: Omit<ViewerErrorFallbackProps, 'title'>) => {
  return <ViewerErrorFallback title="Failed to Compile" {...props} />;
};
