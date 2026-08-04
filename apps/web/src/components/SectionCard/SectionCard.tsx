import type React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

export type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
};

export const SectionCard = ({ children, className, 'data-testid': testId }: SectionCardProps) => (
  <div
    className={cn('bg-card text-card-foreground border-border rounded-2xl border p-6 shadow-sm', className)}
    data-testid={testId}
  >
    {children}
  </div>
);
