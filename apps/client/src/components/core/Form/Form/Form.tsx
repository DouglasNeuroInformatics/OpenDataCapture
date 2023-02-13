import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { clsx } from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { SelectField, SelectFieldProps } from '../SelectField';
import { SubmitButton } from '../SubmitButton';
import { TextField, TextFieldProps } from '../TextField';

export type FormDataType = Record<string, any>;

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: Omit<TextFieldProps, 'name'> | Omit<SelectFieldProps<T[K]>, 'name'>;
};

export interface FormProps<T extends FormDataType> {
  className?: string;
  fields: FormFields<T>;
  schema: JSONSchemaType<T>;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormDataType>({ className, fields, schema, onSubmit }: FormProps<T>) => {
  const methods = useForm<T>({
    resolver: ajvResolver<T>(schema)
  });

  return (
    <FormProvider {...methods}>
      <form autoComplete="off" className={clsx('w-full', className)} onSubmit={methods.handleSubmit(onSubmit)}>
        {Object.keys(fields).map((name) => {
          const props = fields[name];
          switch (props.kind) {
            case 'text':
              return <TextField key={name} name={name} {...props} />;
            case 'select':
              return <SelectField key={name} name={name} {...props} />;
          }
        })}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
