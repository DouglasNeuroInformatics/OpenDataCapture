import React from 'react';

import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { ClipboardCheckIcon, FileQuestionIcon, ListChecksIcon, MonitorCheckIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type InstrumentIconProps = {
  kind: InstrumentKind | null;
} & React.ComponentPropsWithoutRef<LucideIcon>;

export const InstrumentIcon = ({ kind, ...props }: InstrumentIconProps) => {
  switch (kind) {
    case 'FORM':
      return <ClipboardCheckIcon {...props} />;
    case 'INTERACTIVE':
      return <MonitorCheckIcon {...props} />;
    case null:
      return <FileQuestionIcon {...props} />;
    case 'SERIES':
      return <ListChecksIcon {...props} />;
    default:
      console.error(`ERROR: Unhandled instrument kind: ${kind}`);
      return null;
  }
};
