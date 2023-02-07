import React from 'react';

import clsx from 'clsx';

import { FormFieldDataType, FormSchemaType } from './types';

export interface FormProps<T extends Record<string, FormFieldDataType>>
  extends Omit<React.ComponentPropsWithoutRef<'form'>, 'children'> {
  className?: string;
  schema: FormSchemaType<T>;
}

export const Form = <T extends Record<string, any>>({ className, schema, ...props }: FormProps<T>) => {
  return (
    <React.Fragment>
      <form autoComplete="off" className={clsx('w-full', className)} {...props}>
        {Object.entries(schema.properties).map(([name, { type }]) => {
          switch (type) {
            case 'string':
              return (
                <div className="flex">
                  <input name={name} type="text" />
                  <label htmlFor={name}>{name}</label>
                </div>
              );
            default:
              return 'ERROR';
          }
        })}
      </form>
    </React.Fragment>
  );
};
