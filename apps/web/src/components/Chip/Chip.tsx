import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

type ChipVariant = 'default' | 'warning';

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
};

// The page background is one step darker than a card in either theme, so a chip filled with it
// reads as a distinct object on a card, where libui's secondary badge blends in.
const VARIANT_CLASSES: { [K in ChipVariant]: string } = {
  default: 'border-border bg-background text-foreground',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
};

export const Chip = ({ className, variant = 'default', ...props }: ChipProps) => (
  <span
    className={cn(
      'inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-medium',
      VARIANT_CLASSES[variant],
      className
    )}
    {...props}
  />
);
