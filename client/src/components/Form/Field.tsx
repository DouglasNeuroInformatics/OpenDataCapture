import React, { useContext } from 'react';

import FormErrorMessage from './FormErrorMessage';

import FormContext from '@/context/FormContext';

interface FieldProps {
  children: React.ReactNode;
  name: string;
}

const Field = ({ children, name }: FieldProps) => {
  const formContext = useContext(FormContext);
  const errors = formContext.errors?.fields?.[name];
  return (
    <React.Fragment>
      <div className="relative z-50 mt-4 mb-2 w-full">{children}</div>
      {errors && errors.map((error) => <FormErrorMessage key={error}>{error}</FormErrorMessage>)}
    </React.Fragment>
  );
};

export { Field as default, type FieldProps };
