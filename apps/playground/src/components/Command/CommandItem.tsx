import React, { forwardRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Command as CommandPrimitive } from 'cmdk';

export const CommandItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function CommandItem({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'aria-selected:bg-accent aria-selected:text-accent-foreground rounded-xs outline-hidden relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
