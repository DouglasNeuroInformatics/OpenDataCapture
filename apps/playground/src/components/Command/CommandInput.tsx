import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

export const CommandInput = ({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) => (
  // eslint-disable-next-line react/no-unknown-property -- cmdk's stylesheet selects on the cmdk-input-wrapper attribute, which React's known-property list lacks
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      className={cn(
        'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
);
