import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { Command as CommandPrimitive } from 'cmdk';

export const CommandList = ({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List className={cn('max-h-75 overflow-x-hidden overflow-y-auto', className)} ref={ref} {...props} />
);
