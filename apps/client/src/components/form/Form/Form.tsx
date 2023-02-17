import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { fullFormats } from 'ajv-formats/dist/formats';
import { clsx } from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { FormGroup } from '../FormGroup';
import { SubmitButton } from '../SubmitButton';
import { FormDataType, FormFields } from '../types';

export interface FormProps<T extends FormDataType> {
  className?: string;
  fields: FormFields<T>;
  schema: JSONSchemaType<T>;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormDataType>({ className, fields, schema, onSubmit }: FormProps<T>) => {
  const methods = useForm<T>({
    resolver: ajvResolver<T>(schema, {
      formats: fullFormats
    })
  });

  const handleFormSubmission = (data: T) => {
    methods.reset();
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        autoComplete="off"
        className={clsx('w-full', className)}
        onSubmit={methods.handleSubmit(handleFormSubmission)}
      >
        {fields.map((props) => (
          <FormGroup key={props.title} {...props} />
        ))}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
