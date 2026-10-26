import * as React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Separator } from 'react-resizable-panels';

export type ResizableHandleProps = React.ComponentProps<typeof Separator>;

// The separator between stacked panels is a horizontal line, so the library marks the separator of a
// vertical group `aria-orientation="horizontal"`; the stacked-layout styles key on that.
export const ResizableHandle = ({ className, ...props }: ResizableHandleProps) => (
  <Separator
    className={cn(
      'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2',
      className
    )}
    {...props}
  />
);
