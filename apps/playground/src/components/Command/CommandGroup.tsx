import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Command as CommandPrimitive } from 'cmdk';

export const CommandGroup = ({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium',
      className
    )}
    ref={ref}
    {...props}
  />
);
