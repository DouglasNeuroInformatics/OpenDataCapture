import { Heading } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { InstrumentBundlerError } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';

import { CodeErrorBlock } from './CodeErrorBlock';
import { ErrorMessage } from './ErrorMessage';
import { StackTrace } from './StackTrace';
import { ToggledContent } from './ToggledContent';

export type InstrumentErrorFallbackProps = {
  className?: string;
  context: {
    files: BundlerInput[];
    indexFilename: null | string;
  };
  description?: string;
  error: Error;
  title: string;
};

export const InstrumentErrorFallback = ({
  className,
  context,
  description,
  error,
  title
}: InstrumentErrorFallbackProps) => {
  return error ? (
    <div className={cn('space-y-2', className)}>
      <div className="pb-2">
        <Heading className="font-bold" variant="h4">
          {title}
        </Heading>
        {description && <p className="mb-4 text-sm">{description}</p>}
        <ErrorMessage error={error} />
        {InstrumentBundlerError.isInstance(error, 'ESBUILD_FAILURE') && (
          <CodeErrorBlock context={context} error={error} />
        )}
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
