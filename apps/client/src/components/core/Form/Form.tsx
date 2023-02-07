import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { clsx } from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { SubmitButton } from './SubmitButton';
import { TextField, TextFieldInputType } from './TextField';

export type FormDataType = Record<string, any>;

export type InputType = TextFieldInputType;

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: {
    label: string;
    description?: string;
    inputType: InputType;
  };
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
        {Object.entries(fields).map(([name, { label, inputType }]) => {
          switch (inputType) {
            case 'text':
              return <TextField key={name} label={label} name={name} type="text" />;
            case 'password':
              return <TextField key={name} label={label} name={name} type="password" />;
          }
        })}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
