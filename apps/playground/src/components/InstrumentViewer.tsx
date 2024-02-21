import React, { useImperativeHandle, useState } from 'react';

import { Spinner, cn } from '@douglasneuroinformatics/ui';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import { match } from 'ts-pattern';

import type { TranspilerState } from '@/hooks/useTranspiler';

import { CompileErrorFallback } from './CompileErrorFallback';

export type InstrumentViewerRef = {
  forceRefresh: () => void;
};

export type InstrumentViewerProps = {
  className?: string;
  state: TranspilerState;
};

export const InstrumentViewer = React.forwardRef<InstrumentViewerRef, InstrumentViewerProps>(function InstrumentViewer(
  { className, state },
  ref
) {
  const [rendererKey, setRendererKey] = useState(0);
  useImperativeHandle(
    ref,
    () => ({
      forceRefresh: () => {
        setRendererKey((prevKey) => prevKey + 1);
      }
    }),
    []
  );

  return (
    <div className={cn('h-full min-h-0 overflow-scroll', className)}>
      <div className="h-full p-2">
        {match(state)
          .with({ status: 'built' }, ({ bundle }) => (
            <InstrumentRenderer
              bundle={bundle}
              customErrorFallback={CompileErrorFallback}
              key={rendererKey}
              options={{ validate: true }}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
              }}
            />
          ))
          .with({ status: 'error' }, CompileErrorFallback)
          .with({ status: 'loading' }, () => <Spinner />)
          .exhaustive()}
      </div>
    </div>
  );
});
