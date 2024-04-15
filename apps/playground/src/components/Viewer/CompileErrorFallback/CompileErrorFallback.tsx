import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { StackTrace } from './StackTrace';
import { ToggledContent } from './ToggledContent';

const ErrorMessage: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <p className="text-destructive font-medium tracking-tight">
      {error instanceof z.ZodError
        ? fromZodError(error, {
            prefix: 'Validation Error'
          }).message
        : `Error: ${error.message}`}
    </p>
  );
};

export const CompileErrorFallback: React.FC<{ className?: string; error: Error }> = ({ className, error }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="pb-2">
        <Heading className="font-bold" variant="h4">
          Failed to Compile
        </Heading>
        <ErrorMessage error={error} />
      </div>
      {error.cause instanceof Error && error.message !== error.cause.message && (
        <ToggledContent label="Cause">
          <ErrorMessage error={error.cause} />
        </ToggledContent>
      )}
      {error.stack && <StackTrace stack={error.stack} />}
    </div>
  );
};
