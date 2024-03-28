import React, { useEffect } from 'react';

export type ErrorFallbackProps = {
  error: {
    message: string;
  };
};

export const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen  flex-col items-center justify-center gap-1 p-3 text-center">
      <h1 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">Unexpected Error</h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">Something Went Wrong</h3>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm sm:text-base">
        We apologize for the inconvenience. Please contact us for further assistance.
      </p>
      <div className="mt-6">
        <button
          className="text-sky-800 underline-offset-4 hover:text-sky-700 hover:underline dark:text-sky-200 dark:hover:text-sky-300"
          type="button"
          onClick={() => {
            window.location.assign(window.location.origin);
          }}
        >
          Reload Page<span aria-hidden="true"> &rarr;</span>
        </button>
      </div>
    </div>
  );
};
