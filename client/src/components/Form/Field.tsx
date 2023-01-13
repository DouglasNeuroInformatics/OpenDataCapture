import React from 'react';

import FormErrorMessage from './FormErrorMessage';

interface FieldProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

const Field = ({ children, error }: FieldProps) => {
  return (
    <React.Fragment>
      <div className="relative mt-4 mb-2 flex w-full flex-col">{children}</div>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </React.Fragment>
  );
};

export { Field as default, type FieldProps };
