import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import clsx from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { SubmitButton } from '../SubmitButton';
import { TextField } from '../TextField/TextField';

export type FormSchemaType<T extends Record<string, any>> = JSONSchemaType<T> & {
  properties: {
    [K in keyof T]: JSONSchemaType<T[K]>;
  };
};

export interface FormProps<T extends Record<string, any>> {
  className?: string;
  schema: FormSchemaType<T>;
  onSubmit: (data: T) => void;
}

export const Form = <T extends Record<string, any>>({ className, schema, onSubmit }: FormProps<T>) => {
  const methods = useForm<T>({
    resolver: ajvResolver<T>(schema)
  });

  return (
    <FormProvider {...methods}>
      <form autoComplete="off" className={clsx('w-full', className)} onSubmit={methods.handleSubmit(onSubmit)}>
        {Object.entries(schema.properties).map(([name, { type }]) => {
          switch (type) {
            case 'string':
              return <TextField key={name} name={name} />;
            default:
              return 'ERROR';
          }
        })}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
