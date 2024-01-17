// import { match } from 'ts-pattern';

import { useInterpreter } from '../../hooks/useInterpreter';
import { useTranslatedInstrument } from '../../hooks/useTranslatedInstrument';

export type InstrumentRendererProps = {
  bundle: string;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InstrumentRenderer = ({ bundle }: InstrumentRendererProps) => {
  const instrument = useInterpreter(bundle);
  const translatedInstrument = useTranslatedInstrument(instrument);
  console.error(instrument);

  // match(instrument).with({ kind: 'FORM' }, (form) => <FormStepper form={form} />);

  return (
    <>
      <iframe srcDoc="Hello World" title="Open Data Capture - Interactive Instrument" />
      <p>{bundle}</p>
    </>
  );
};
