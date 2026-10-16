import * as React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { PanelResizeHandle } from 'react-resizable-panels';

export type ResizableHandleProps = React.ComponentProps<typeof PanelResizeHandle>;

export const ResizableHandle = ({ className, ...props }: ResizableHandleProps) => (
  <PanelResizeHandle
    className={cn(
      'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2',
      className
    )}
    {...props}
  />
);
