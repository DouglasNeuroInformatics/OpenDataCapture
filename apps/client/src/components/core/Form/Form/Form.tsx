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
  [K in keyof T]: Omit<TextFieldProps, 'name'> | Omit<SelectFieldProps, 'name'>;
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

  methods.formState.errors;

  return (
    <FormProvider {...methods}>
      <form autoComplete="off" className={clsx('w-full', className)} onSubmit={methods.handleSubmit(onSubmit)}>
        {Object.entries(fields).map(([name, props]) => {
          switch (props.kind) {
            case 'text':
              return <TextField key={name} kind={props.kind} label={props.label} name={name} variant={props.variant} />;
            case 'select':
              return (
                <SelectField key={name} kind={props.kind} label={props.label} name={name} options={props.options} />
              );
            default:
              throw new Error('Not Implemented!');
          }
        })}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
