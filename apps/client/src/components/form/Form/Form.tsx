import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { fullFormats } from 'ajv-formats/dist/formats';
import { clsx } from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { DateField } from '../DateField';
import { SelectField } from '../SelectField';
import { SubmitButton } from '../SubmitButton';
import { TextField } from '../TextField';
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
        {Object.keys(fields).map((name) => {
          const props = fields[name];
          switch (props.kind) {
            case 'text':
              return <TextField key={name} name={name} {...props} />;
            case 'select':
              return <SelectField key={name} name={name} {...props} />;
            case 'date':
              return <DateField key={name} name={name} {...props} />;
          }
        })}
        <SubmitButton />
      </form>
    </FormProvider>
  );
};
