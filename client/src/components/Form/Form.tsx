import React from 'react';

import classNames from 'classnames';

import FormErrorMessage from './FormErrorMessage';

interface FormProps extends React.HTMLProps<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

const Form = ({ children, className, error, ...props }: FormProps) => {
  console.log('form', error);
  return (
    <React.Fragment>
      <form autoComplete="off" className={classNames('w-full', className)} {...props}>
        {children}
      </form>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </React.Fragment>
  );
};

export { Form as default, type FormProps };
