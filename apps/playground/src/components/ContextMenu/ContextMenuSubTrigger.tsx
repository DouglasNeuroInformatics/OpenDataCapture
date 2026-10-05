import React, { forwardRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { ChevronRightIcon } from 'lucide-react';

export const ContextMenuSubTrigger = forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(function ContextMenuSubTrigger({ children, className, inset, ...props }, ref) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden select-none',
        inset && 'pl-8',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
  );
});
