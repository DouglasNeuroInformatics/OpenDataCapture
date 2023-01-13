import React from 'react';

import classNames from 'classnames';

interface FormProps extends React.HTMLProps<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

const Form = ({ children, className, error, ...props }: FormProps) => {
  return (
    <React.Fragment>
      <form autoComplete="off" className={classNames('w-full', className)} {...props}>
        {children}
      </form>
      {error && <span className="text-red-700">{children}</span>}
    </React.Fragment>
  );
};

export { Form as default, type FormProps };
