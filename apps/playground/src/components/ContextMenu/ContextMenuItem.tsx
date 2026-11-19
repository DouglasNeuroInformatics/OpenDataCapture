import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

export const ContextMenuItem = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) => (
  <ContextMenuPrimitive.Item
    className={cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
);
