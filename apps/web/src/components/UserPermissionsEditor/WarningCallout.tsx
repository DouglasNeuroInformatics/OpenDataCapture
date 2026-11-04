import type React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { TriangleAlertIcon } from 'lucide-react';

type WarningCalloutProps = {
  children: React.ReactNode;
  className?: string;
  'data-testid': string;
};

/** A warning about what saving the permissions as they stand will do, announced as soon as it appears. */
export const WarningCallout = ({ children, className, 'data-testid': testId }: WarningCalloutProps) => (
  <div
    className={cn(
      'flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300',
      className
    )}
    data-testid={testId}
    role="alert"
  >
    <TriangleAlertIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
    <p>{children}</p>
  </div>
);
