import React from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import { replacer } from '@opendatacapture/json-utils';
import { ErrorBoundary } from 'react-error-boundary';
import { P, match } from 'ts-pattern';

import { useTranspiler } from '@/hooks/useTranspiler';
import { useAppStore } from '@/store';

import { CompileErrorFallback } from './CompileErrorFallback';
import { RuntimeErrorFallback } from './RuntimeErrorFallback';

export const Viewer = () => {
  const state = useTranspiler();
  const key = useAppStore((store) => store.viewer.key);
  return (
    <div className="h-full overflow-scroll" key={key}>
      {match(state)
        .with({ status: 'built' }, ({ bundle }) => (
          <ErrorBoundary FallbackComponent={RuntimeErrorFallback}>
            <InstrumentRenderer
              bundle={bundle}
              customErrorFallback={CompileErrorFallback}
              options={{ validate: true }}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify({ _message: 'The following data will be submitted', data }, replacer, 2));
              }}
            />
          </ErrorBoundary>
        ))
        .with({ status: 'error' }, CompileErrorFallback)
        .with({ status: P.union('building', 'initial') }, () => <Spinner />)
        .exhaustive()}
    </div>
  );
};
