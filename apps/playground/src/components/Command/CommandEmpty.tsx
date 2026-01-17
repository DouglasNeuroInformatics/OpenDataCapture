import React, { forwardRef } from 'react';

import { Command as CommandPrimitive } from 'cmdk';

export const CommandEmpty = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty(props, ref) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm" ref={ref} {...props} />;
});
