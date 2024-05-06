import React from 'react';

import { ViewerErrorFallback, type ViewerErrorFallbackProps } from './ViewerErrorFallback';

export const RuntimeErrorFallback = (props: Omit<ViewerErrorFallbackProps, 'title'>) => {
  return (
    <ViewerErrorFallback
      description="This means that your instrument successfully compiled, but caused an unexpected exception to be thrown in the browser. For example, this could happen in the render function of a dynamic form field. Although the bundler attempts to validate the structure of instruments at compile time, it is not possible to evaluate the runtime behavior of arbitrary JavaScript code."
      title="Unhandled Runtime Error"
      {...props}
    />
  );
};
