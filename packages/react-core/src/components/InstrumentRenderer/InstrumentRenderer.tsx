import type { ReactNode } from 'react';

import type { Language } from '@opendatacapture/schemas/core';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';

import { ScalarInstrumentRenderer } from './ScalarInstrumentRenderer';
import { SeriesInstrumentRenderer } from './SeriesInstrumentRenderer';

import type { LocalizedText, SubjectDisplayInfo } from '../../types';
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
  /**
   * The language to run the instrument in, leaving the interface language alone. Defaults to the interface language.
   * Naming one also skips an interactive instrument's own language selection screen, since the choice is made.
   */
  language?: Language;
  NavigationBlocker?: NavigationBlockerComponent;
  onSubmit: InstrumentSubmitHandler;
  subject?: SubjectDisplayInfo;
  /** A localizable label for the submit button shown on the instrument's form(s). */
  submitButtonLabel?: LocalizedText;
  target: InstrumentBundleContainer;
};

export const InstrumentRenderer = ({ target, ...props }: InstrumentRendererProps) => {
  if (target.kind === 'SERIES') {
    return <SeriesInstrumentRenderer target={target} {...props} />;
  }
  return <ScalarInstrumentRenderer target={target} {...props} />;
};
