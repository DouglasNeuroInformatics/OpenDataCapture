import React from 'react';

import type { TranspilerError } from '@/utils/error';

import { CodeErrorBlock } from './CodeErrorBlock';

export type ErrorMessageProps = {
  error: TranspilerError;
};

export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  return (
    <React.Fragment>
      <div className="text-destructive font-medium tracking-tight">
        <span>{error.name}: </span>
        <span>{error.message}</span>
      </div>
      {error.name === 'Build Error' && <CodeErrorBlock error={error.cause} />}
    </React.Fragment>
  );
};
