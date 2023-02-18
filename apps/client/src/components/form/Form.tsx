import React from 'react';

import { DevTool } from '@hookform/devtools';
import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { fullFormats } from 'ajv-formats/dist/formats';
import { clsx } from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '../base';

import { ArrayField } from './ArrayField';
import { PrimitiveField } from './PrimitiveField';
import { FormDataType, FormStructure } from './types';

export interface FormProps<T extends FormDataType> {
  className?: string;
  structure: FormStructure<T>;
  validationSchema: JSONSchemaType<T>;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormDataType>({ className, structure, validationSchema, onSubmit }: FormProps<T>) => {
  const methods = useForm<T>({
    resolver: ajvResolver<T>(validationSchema, {
      formats: fullFormats
    })
  });

  const handleFormSubmission = (data: T) => {
    methods.reset();
    onSubmit(data);
  };

  return (
    <React.Fragment>
      <FormProvider {...methods}>
        <form
          autoComplete="off"
          className={clsx('w-full', className)}
          onSubmit={methods.handleSubmit(handleFormSubmission)}
        >
          {structure.map(({ title, fields }, i) => (
            <div key={i}>
              {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
              {Object.keys(fields).map((name) => {
                const props = fields[name];
                if (!props) {
                  return null;
                } else if (props?.kind === 'array') {
                  return <ArrayField key={name} name={name} {...props} />;
                } else {
                  return <PrimitiveField key={name} name={name} {...props} />;
                }
              })}
            </div>
          ))}
          <Button label="Submit" type="submit" />
        </form>
      </FormProvider>
      <DevTool control={methods.control} />
    </React.Fragment>
  );
};
