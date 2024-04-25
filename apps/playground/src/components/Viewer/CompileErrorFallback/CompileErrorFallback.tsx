import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { InstrumentBundlerBuildError } from '@opendatacapture/instrument-bundler';

import { CodeErrorBlock } from './CodeErrorBlock';
import { ErrorMessage } from './ErrorMessage';
import { StackTrace } from './StackTrace';
import { ToggledContent } from './ToggledContent';

export type CompileErrorFallbackProps = {
  className?: string;
  error: Error;
};

export const CompileErrorFallback = ({ className, error }: CompileErrorFallbackProps) => {
  return error ? (
    <div className={cn('space-y-2', className)}>
      <div className="pb-2">
        <Heading className="font-bold" variant="h4">
          Failed to Compile
        </Heading>
        <ErrorMessage error={error} />
        {error instanceof InstrumentBundlerBuildError && <CodeErrorBlock error={error} />}
      </div>
      {error.cause instanceof Error && (
        <ToggledContent label="Cause">
          <ErrorMessage error={error.cause} />
        </ToggledContent>
      )}
      {error.stack && <StackTrace stack={error.stack} />}
    </div>
  ) : null;
};
