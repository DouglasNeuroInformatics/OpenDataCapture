import React from 'react';

export interface FormFieldContainerProps {
  children: React.ReactNode;
}

export const FormFieldContainer = ({ children }: FormFieldContainerProps) => {
  return <div className="relative my-6 flex flex-col">{children}</div>;
};
