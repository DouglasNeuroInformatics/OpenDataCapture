import React, { forwardRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

export const ContextMenuItem = forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(function ContextMenuItem({ className, inset, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        'focus:bg-accent focus:text-accent-foreground rounded-xs outline-hidden relative flex cursor-default select-none items-center px-2 py-1.5 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
