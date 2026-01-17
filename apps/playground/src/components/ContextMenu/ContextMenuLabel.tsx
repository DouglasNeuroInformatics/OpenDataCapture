import React, { forwardRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

export const ContextMenuLabel = forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(function ContextMenuLabel({ className, inset, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Label
      className={cn('text-foreground px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
      ref={ref}
      {...props}
    />
  );
});
