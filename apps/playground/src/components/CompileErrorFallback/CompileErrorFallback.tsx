import React from 'react';

import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { StackTrace } from './StackTrace';
import { ToggledContent } from './ToggledContent';

const ErrorMessage: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <span className="text-destructive font-medium">
      {error instanceof z.ZodError
        ? fromZodError(error, {
            prefix: 'Validation Error'
          }).message
        : `Error: ${error.message}`}
    </span>
  );
};

export const CompileErrorFallback: React.FC<{ className?: string; error: Error }> = ({ className, error }) => {
  return (
    <Card className={cn('flex max-h-full flex-col p-3 tracking-tight', className)}>
      <div className="h-full overflow-scroll">
        <div className="space-y-1 py-3">
          <Heading variant="h4">Failed to Compile</Heading>
          <ErrorMessage error={error} />
        </div>
        {error.cause instanceof Error && error.message !== error.cause.message && (
          <ToggledContent label="Cause">
            <ErrorMessage error={error.cause} />
          </ToggledContent>
        )}
        {error.stack && <StackTrace stack={error.stack} />}
      </div>
    </Card>
  );
};
