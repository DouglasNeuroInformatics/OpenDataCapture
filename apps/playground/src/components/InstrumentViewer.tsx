import { Spinner, cn } from '@douglasneuroinformatics/ui';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import { match } from 'ts-pattern';

import type { TranspilerState } from '@/hooks/useTranspiler';

import { CompileErrorFallback } from './CompileErrorFallback';

export type InstrumentViewerProps = {
  className?: string;
  state: TranspilerState;
};

export const InstrumentViewer = ({ className, state }: InstrumentViewerProps) => {
  return (
    <div className={cn('h-full min-h-0', className)}>
      <div className="h-full overflow-scroll p-2">
        {match(state)
          .with({ status: 'built' }, ({ bundle }) => (
            <InstrumentRenderer
              bundle={bundle}
              customErrorFallback={CompileErrorFallback}
              options={{ validate: true }}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify({ _message: 'The Following Data Will Be Submitted', data }, null, 2));
              }}
            />
          ))
          .with({ status: 'error' }, CompileErrorFallback)
          .with({ status: 'loading' }, () => <Spinner />)
          .exhaustive()}
      </div>
    </div>
  );
};
