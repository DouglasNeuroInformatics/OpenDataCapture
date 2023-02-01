import React from 'react';

export interface ErrorBoxProps {
  message: string;
}

export const ErrorBox = ({ message }: ErrorBoxProps) => {
  return message ? (
    <div>
      <span className="text-red-700">{message}</span>
    </div>
  ) : null;
};
