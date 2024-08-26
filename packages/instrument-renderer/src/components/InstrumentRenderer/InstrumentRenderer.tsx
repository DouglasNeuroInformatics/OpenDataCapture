import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';

import { ScalarInstrumentRenderer } from './ScalarInstrumentRenderer';
import { SeriesInstrumentRenderer } from './SeriesInstrumentRenderer';

import type { InstrumentSubmitHandler, SubjectDisplayInfo } from '../../types';

export type InstrumentRendererProps = {
  className?: string;
  onSubmit: InstrumentSubmitHandler;
  subject?: SubjectDisplayInfo;
  target: InstrumentBundleContainer;
};

export const InstrumentRenderer = ({ target, ...props }: InstrumentRendererProps) => {
  if (target.kind === 'SERIES') {
    return <SeriesInstrumentRenderer target={target} {...props} />;
  }
  return <ScalarInstrumentRenderer target={target} {...props} />;
};
