import { InstrumentErrorFallback } from '@opendatacapture/react-core';
import type { InstrumentErrorFallbackProps } from '@opendatacapture/react-core';

export const RuntimeErrorFallback = (props: Omit<InstrumentErrorFallbackProps, 'title'>) => {
  return (
    <InstrumentErrorFallback
      description="This means that your instrument successfully compiled, but caused an unexpected exception to be thrown in the browser. For example, this could happen in the render function of a dynamic form field. Although the bundler attempts to validate the structure of instruments at compile time, it is not possible to evaluate the runtime behavior of arbitrary JavaScript code."
      title="Unhandled Runtime Error"
      {...props}
    />
  );
};
