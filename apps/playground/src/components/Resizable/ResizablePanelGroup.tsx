import * as React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { PanelGroup } from 'react-resizable-panels';

export type ResizablePanelGroupProps = React.ComponentProps<typeof PanelGroup>;

export const ResizablePanelGroup = ({ className, ...props }: ResizablePanelGroupProps) => (
  <PanelGroup
    className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
);
