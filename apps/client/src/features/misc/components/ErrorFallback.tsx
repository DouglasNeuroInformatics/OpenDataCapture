import React from 'react';

import { Button } from '@douglasneuroinformatics/react-components';
import { FallbackProps } from 'react-error-boundary';

export interface ErrorFallbackProps extends FallbackProps {
  error: {
    message: string;
  };
}

export const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-red-500" role="alert">
      <h2 className="text-3xl font-semibold">Oops! Something went wrong</h2>
      <p>Error Message: {error.message}</p>
      <Button className="mt-4" label="Refresh" onClick={() => window.location.assign(window.location.origin)} />
    </div>
  );
};
