import { Spinner } from '@douglasneuroinformatics/ui';
import { match } from 'ts-pattern';

import { useResolvedInstrument } from '../hooks/useResolvedInstrument';
import { FormStepper } from './FormStepper';
import { InteractiveStepper } from './InteractiveStepper';

export type InstrumentRendererProps = {
  bundle: string;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InstrumentRenderer = ({ bundle }: InstrumentRendererProps) => {
  const instrument = useResolvedInstrument(bundle);

  const handleSubmit = (data: unknown) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };

  return match(instrument)
    .with({ kind: 'FORM' }, (form) => <FormStepper form={form} onSubmit={handleSubmit} />)
    .with({ kind: 'INTERACTIVE' }, (instrument) => (
      <InteractiveStepper instrument={instrument} onSubmit={handleSubmit} />
    ))
    .with(null, () => <Spinner />)
    .exhaustive();

  // return (
  //   <>
  //     <iframe srcDoc="Hello World" title="Open Data Capture - Interactive Instrument" />
  //     <p>{bundle}</p>
  //   </>
  // );
};
