import React, { useState } from 'react';

import Ajv, { JSONSchemaType } from 'ajv';

import { FormContext } from '../context/FormContext';
import { DistributiveOmit, FieldValue, FormErrors, FormValues } from '../types';

import { TextField, TextFieldProps } from './TextField';

import { Button } from '@/components/base';

type TextFieldType = DistributiveOmit<TextFieldProps, 'name' | 'value' | 'onChange'>;

const ajv = new Ajv({
  allErrors: true,
  strict: true
});

export interface FormProps<T extends FormValues> {
  structure: Array<{
    title?: string;
    fields: {
      [K in keyof T]?: T[K] extends string ? TextFieldType : never;
    };
  }>;
  validationSchema: JSONSchemaType<T>;
  onSubmit: (values: T) => void;
}

export const Form = <T extends FormValues = FormValues>({ structure, validationSchema, onSubmit }: FormProps<T>) => {
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const [values, setValues] = useState<T>(
    Object.fromEntries(
      structure.flatMap((group) =>
        Object.keys(group.fields).map((field: keyof T) => {
          switch (group.fields[field]!.kind) {
            case 'text':
              return [field, ''] as const;
          }
        })
      )
    ) as T
  );

  const handleChange = (key: keyof T, value: FieldValue) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const validate = ajv.compile<T>(validationSchema);
    const valid = validate(values);
    if (valid) {
      onSubmit(values);
    } else if (validate.errors) {
      const errors = Object.fromEntries(
        validate.errors.map((error) => [
          error.instancePath.split('/').filter((s) => s)[0] as keyof T,
          `${error.keyword}: ${error.message!}`
        ])
      ) as FormErrors<T>;
      setErrors(errors);
    } else {
      console.error('An unexpected error occurred during form validation', validate);
    }
  };

  return (
    <FormContext.Provider value={{ errors, values, onChange: handleChange }}>
      <form onSubmit={handleSubmit}>
        {structure.map(({ title, fields }, i) => (
          <div key={i}>
            {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
            {Object.keys(fields).map((name) => {
              let fieldElement: JSX.Element;
              const props = { name, ...fields[name]! };
              switch (props.kind) {
                case 'text':
                  fieldElement = <TextField value={values[name] as string} onChange={handleChange} {...props} />;
              }
              return (
                <div className="relative my-6 flex w-full flex-col" key={name}>
                  {fieldElement}
                  <span className="block text-red-600">{errors[name]}</span>
                </div>
              );
            })}
          </div>
        ))}
        <Button label="Submit" type="submit" />
      </form>
    </FormContext.Provider>
  );
};
