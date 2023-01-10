import React from 'react';

import classNames from 'classnames';
import { Form as ReactRouterForm } from 'react-router-dom';

interface FormProps {
  children: React.ReactNode;
  className?: string;
}

const Form = ({ children, className }: FormProps) => {
  return (
    <ReactRouterForm autoComplete="off" className={classNames('max-w-lg', className)} method="post">
      {children}
    </ReactRouterForm>
  );
};

export { Form as default, type FormProps };
