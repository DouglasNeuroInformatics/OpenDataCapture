import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';

import type { TranspilerError } from '@/utils/error';

import { ErrorMessage } from './ErrorMessage';
import { StackTrace } from './StackTrace';
import { ToggledContent } from './ToggledContent';

export type CompileErrorFallbackProps = {
  className?: string;
  error: TranspilerError;
};

export const CompileErrorFallback = ({ className, error }: CompileErrorFallbackProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="pb-2">
        <Heading className="font-bold" variant="h4">
          Failed to Compile
        </Heading>
        <ErrorMessage error={error} />
      </div>
      {error.name !== 'Build Error' && error.cause && (
        <ToggledContent label="Cause">
          <ErrorMessage error={error.cause} />
        </ToggledContent>
      )}
      {error.stack && <StackTrace stack={error.stack} />}
    </div>
  );
};
