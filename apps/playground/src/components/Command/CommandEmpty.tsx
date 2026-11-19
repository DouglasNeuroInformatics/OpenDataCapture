import React from 'react';

import { Command as CommandPrimitive } from 'cmdk';

export const CommandEmpty = ({ ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-6 text-center text-sm" ref={ref} {...props} />
);
