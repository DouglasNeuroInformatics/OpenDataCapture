import type { ReactNode } from 'react';

import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';

import { ScalarInstrumentRenderer } from './ScalarInstrumentRenderer';
import { SeriesInstrumentRenderer } from './SeriesInstrumentRenderer';

import type { SubjectDisplayInfo } from '../../types';
import type { NavigationBlockerComponent } from '../NavigationBlockerDialog';
import type { InstrumentSubmitHandler } from './types';

export type InstrumentRendererProps = {
  /** Content rendered directly above the "Begin" button on the overview screen. */
  beforeBegin?: ReactNode;
  className?: string;
  /** When true, the "Begin" button on the overview screen is disabled. */
  disableBegin?: boolean;
  /** Whether to disable copy, download, print in the final summary */
  disableSummaryActions?: boolean;
  initialSeriesIndex?: number;
  NavigationBlocker?: NavigationBlockerComponent;
  onSubmit: InstrumentSubmitHandler;
  subject?: SubjectDisplayInfo;
  target: InstrumentBundleContainer;
};

export const InstrumentRenderer = ({ NavigationBlocker, target, ...props }: InstrumentRendererProps) => {
  if (target.kind === 'SERIES') {
    return <SeriesInstrumentRenderer target={target} {...props} />;
  }
  return <ScalarInstrumentRenderer NavigationBlocker={NavigationBlocker} target={target} {...props} />;
};
