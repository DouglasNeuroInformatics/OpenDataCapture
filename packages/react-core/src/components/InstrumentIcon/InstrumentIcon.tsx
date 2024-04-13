import React from 'react';

import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import { ClipboardCheckIcon, type LucideIcon, MonitorCheckIcon } from 'lucide-react';

export type InstrumentIconProps = {
  kind: InstrumentKind;
} & React.ComponentPropsWithoutRef<LucideIcon>;

export const InstrumentIcon = ({ kind, ...props }: InstrumentIconProps) => {
  switch (kind) {
    case 'FORM':
      return <ClipboardCheckIcon {...props} />;
    case 'INTERACTIVE':
      return <MonitorCheckIcon {...props} />;
    default:
      console.error(`ERROR: Unhandled instrument kind: ${kind}`);
      return null;
  }
};
