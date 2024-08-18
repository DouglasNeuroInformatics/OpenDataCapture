import React from 'react';

import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { ClipboardCheckIcon, FileQuestionIcon, ListChecksIcon, type LucideIcon, MonitorCheckIcon } from 'lucide-react';

export type InstrumentIconProps = {
  kind: InstrumentKind;
} & React.ComponentPropsWithoutRef<LucideIcon>;

export const InstrumentIcon = ({ kind, ...props }: InstrumentIconProps) => {
  switch (kind) {
    case 'FORM':
      return <ClipboardCheckIcon {...props} />;
    case 'INTERACTIVE':
      return <MonitorCheckIcon {...props} />;
    case 'SERIES':
      return <ListChecksIcon {...props} />;
    case 'UNKNOWN':
      return <FileQuestionIcon {...props} />;
    default:
      console.error(`ERROR: Unhandled instrument kind: ${kind}`);
      return null;
  }
};
