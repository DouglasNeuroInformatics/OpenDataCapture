import { InstrumentBuildFailureError } from '@opendatacapture/instrument-bundler/error';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export type TranspilerError =
  | {
      cause: InstrumentBuildFailureError;
      message: string;
      name: 'Build Error';
      stack?: string;
    }
  | {
      cause?: TranspilerError | null;
      message: string;
      name: 'Error';
      stack?: string;
    }
  | {
      cause?: never;
      message: string;
      name: 'Validation Error';
      stack?: string;
    };

export function parseTranspilerError(err: unknown): TranspilerError {
  let transpilerError: TranspilerError;
  if (err instanceof z.ZodError) {
    const validationError = fromZodError(err, {
      prefix: null
    });
    transpilerError = {
      message: validationError.message,
      name: 'Validation Error',
      stack: err.stack
    };
  } else if (err instanceof InstrumentBuildFailureError) {
    transpilerError = {
      cause: err,
      message: err.cause.errors[0].text,
      name: 'Build Error',
      stack: err.stack
    };
  } else if (err instanceof Error) {
    transpilerError = {
      cause: err.cause ? parseTranspilerError(err.cause) : null,
      message: err.message,
      name: 'Error',
      stack: err.stack
    };
  } else {
    transpilerError = {
      message: 'Unexpected Error',
      name: 'Error'
    };
  }
  return transpilerError;
}
