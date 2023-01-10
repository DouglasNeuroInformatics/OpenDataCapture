import React from 'react';

import classNames from 'classnames';
import { Form as ReactRouterForm } from 'react-router-dom';
import { ZodType } from 'zod';

import useFormAction from '@/hooks/useFormAction';

interface FormProps<T> {
  children: React.ReactNode;
  schema: ZodType<T>;
  className?: string;
}

const Form = <T,>({ children, schema, className }: FormProps<T>) => {
  const result = useFormAction(schema);
  return (
    <ReactRouterForm autoComplete="off" className={classNames('w-full', className)} method="post">
      {children}
    </ReactRouterForm>
  );
};

export { Form as default, type FormProps };
