import React, { useState } from 'react';

import { JSONSchemaType } from 'ajv';

import { DistributiveOmit, FieldChangeHandler, FormValues } from '../types';

import { TextField, TextFieldProps } from './TextField';

import { Button } from '@/components/base';

type TextFieldType = DistributiveOmit<TextFieldProps, 'name' | 'value' | 'onChange'>;

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

  const handleChange: FieldChangeHandler<T> = (key, value) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
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
              <div className="relative my-6 flex w-full" key={name}>
                {fieldElement}
              </div>
            );
          })}
        </div>
      ))}
      <Button label="Submit" type="submit" />
    </form>
  );
};
