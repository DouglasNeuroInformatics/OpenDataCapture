import React from 'react';

export type ErrorMessageProps = {
  error: Error;
};

export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  return (
    <div className="text-destructive font-medium tracking-tight">
      <span>{error.name}: </span>
      <span>{error.message}</span>
    </div>
  );
};
