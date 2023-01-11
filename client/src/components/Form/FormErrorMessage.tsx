import React from 'react';

interface FormErrorMessageProps {
  children: string;
}

const FormErrorMessage = ({ children }: FormErrorMessageProps) => {
  return <span className="text-red-700">{children}</span>;
};

export { FormErrorMessage as default, type FormErrorMessageProps };
