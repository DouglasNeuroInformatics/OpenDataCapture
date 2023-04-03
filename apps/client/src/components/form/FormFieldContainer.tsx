import React from 'react';

import { FormFieldDescription } from './FormFieldDescription';

export interface FormFieldContainerProps {
  children: React.ReactNode;
  description?: string;
  error?: string;
}

export const FormFieldContainer = ({ children, description, error }: FormFieldContainerProps) => {
  return (
    <>
      <div className="relative my-6 flex w-full">
        <div className="flex flex-grow flex-col">{children}</div>
        <FormFieldDescription description={description} />
      </div>
      {error && (
        <div className="text-red-600">
          <span>{error}</span>
        </div>
      )}
    </>
  );
};
