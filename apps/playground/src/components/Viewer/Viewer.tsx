import React from 'react';

import { ScrollArea, Spinner } from '@douglasneuroinformatics/libui/components';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import { P, match } from 'ts-pattern';

import { useTranspiler } from '@/hooks/useTranspiler';
import { useViewerStore } from '@/store/viewer.store';

import { CompileErrorFallback } from './CompileErrorFallback';

export const Viewer = () => {
  const state = useTranspiler();
  const key = useViewerStore((store) => store.key);
  return (
    <div className="h-full pl-12" key={key}>
      {match(state)
        .with({ status: 'built' }, ({ bundle }) => (
          <ScrollArea className="h-full w-full">
            <InstrumentRenderer
              bundle={bundle}
              customErrorFallback={CompileErrorFallback}
              options={{ validate: true }}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
              }}
            />
          </ScrollArea>
        ))
        .with({ status: 'error' }, CompileErrorFallback)
        .with({ status: P.union('building', 'initial') }, () => <Spinner />)
        .exhaustive()}
    </div>
  );
};
