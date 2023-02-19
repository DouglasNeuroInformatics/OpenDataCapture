import React from 'react';

export interface ErrorMessageProps {
  error?: {
    type?: string | number;
    message?: string;
  };
}

export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className="text-red-600">
      <span>{`${error.type!}: ${error.message!}`}</span>
    </div>
  );
};
