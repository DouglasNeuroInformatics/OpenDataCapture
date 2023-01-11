import React from 'react';

import classNames from 'classnames';
import { Form as ReactRouterForm } from 'react-router-dom';

import FormErrorMessage from './FormErrorMessage';

import FormContext from '@/context/FormContext';

interface FormErrors {
  fields?: {
    [key: string]: string[];
  };
  submission?: string[];
}

interface FormProps {
  children: React.ReactNode;
  className?: string;
  errors: FormErrors | null;
}

const Form = ({ children, className, errors }: FormProps) => {
  return (
    <FormContext.Provider value={{ errors }}>
      <ReactRouterForm autoComplete="off" className={classNames('w-full', className)} method="post">
        {children}
      </ReactRouterForm>
      {errors?.submission?.map((error) => (
        <FormErrorMessage key={error}>{error}</FormErrorMessage>
      ))}
    </FormContext.Provider>
  );
};

export { Form as default, type FormProps, type FormErrors };
