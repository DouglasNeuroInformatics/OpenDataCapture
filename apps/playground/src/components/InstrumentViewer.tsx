import { Card, Spinner, cn } from '@douglasneuroinformatics/ui';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { InteractiveStepper } from '@open-data-capture/react-core/components/InteractiveStepper';
import { match } from 'ts-pattern';

import type { TranspilerState } from '@/hooks/useTranspiler';

export type InstrumentViewerProps = {
  className?: string;
  state: TranspilerState;
};

export const InstrumentViewer = ({ className, state }: InstrumentViewerProps) => {
  return (
    <div className={cn('h-full min-h-0', className)}>
      <div className="h-full overflow-scroll p-2">
        {match(state)
          .with({ instrument: { kind: 'form' }, status: 'built' }, ({ instrument }) => (
            <FormStepper
              form={instrument}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify(data));
              }}
            />
          ))
          .with({ instrument: { kind: 'interactive' }, status: 'built' }, ({ instrument }) => {
            return (
              <InteractiveStepper
                instrument={instrument}
                onSubmit={(data) => {
                  // eslint-disable-next-line no-alert
                  alert(JSON.stringify(data));
                }}
              />
            );
          })
          .with({ status: 'error' }, ({ message }) => (
            <div className="flex h-full flex-col items-center justify-center">
              <h3 className="mb-3 text-center font-semibold">Failed to Compile</h3>
              <Card className="overflow-scroll">
                <code className="text-sm">{message}</code>
              </Card>
            </div>
          ))
          .with({ status: 'loading' }, () => <Spinner />)
          .exhaustive()}
      </div>
    </div>
  );
};
