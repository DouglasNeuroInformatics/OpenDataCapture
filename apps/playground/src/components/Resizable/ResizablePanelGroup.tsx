import * as React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Group } from 'react-resizable-panels';

export type ResizablePanelGroupProps = React.ComponentProps<typeof Group>;

export const ResizablePanelGroup = ({ className, ...props }: ResizablePanelGroupProps) => (
  <Group className={cn('flex h-full w-full', className)} {...props} />
);
