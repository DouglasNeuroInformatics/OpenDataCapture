import { InstrumentErrorFallback } from '@opendatacapture/react-core';
import type { InstrumentErrorFallbackProps } from '@opendatacapture/react-core';

export const CompileErrorFallback = (props: Omit<InstrumentErrorFallbackProps, 'title'>) => {
  return <InstrumentErrorFallback title="Failed to Compile" {...props} />;
};
