import React from 'react';

import classNames from 'classnames';

export interface FormElementProps extends React.HTMLProps<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export const FormElement = ({ children, className, error, ...props }: FormElementProps) => {
  return (
    <React.Fragment>
      <form autoComplete="off" className={classNames('w-full', className)} {...props}>
        {children}
      </form>
      {error && <span className="text-red-700">{children}</span>}
    </React.Fragment>
  );
};
