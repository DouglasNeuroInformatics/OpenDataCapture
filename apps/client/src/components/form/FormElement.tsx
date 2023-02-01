import React from 'react';

import clsx from 'clsx';

export interface FormElementProps extends React.HTMLProps<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export const FormElement = ({ children, className, error, ...props }: FormElementProps) => {
  return (
    <React.Fragment>
      <form autoComplete="off" className={clsx('w-full', className)} {...props}>
        {children}
      </form>
      {error && <span className="text-red-700">{error}</span>}
    </React.Fragment>
  );
};
