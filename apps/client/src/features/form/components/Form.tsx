import React, { useState } from 'react';

import { JSONSchemaType } from 'ajv';

import { FormContext } from '../context/FormContext';
import { DistributiveOmit, FormValues } from '../types';

import { TextField, TextFieldProps } from './TextField';

type TextFieldType = DistributiveOmit<TextFieldProps, 'name' | 'value' | 'onChange'>;

const fieldComponents = {
  text: (props: TextFieldProps) => <TextField {...props} />
};

export interface FormProps<T extends FormValues> {
  structure: Array<{
    title?: string;
    fields: {
      [K in keyof T]?: T[K] extends string ? TextFieldType : never;
    };
  }>;
  validationSchema: JSONSchemaType<T>;
}

export const Form = <T extends FormValues = FormValues>({ structure, validationSchema }: FormProps<T>) => {
  const [values, setValues] = useState<FormValues>(
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

  return (
    <FormContext.Provider value={{ values, setValues }}>
      <form>
        {structure.map(({ title, fields }, i) => (
          <div key={i}>
            {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
            {Object.keys(fields).map((name) => {
              return (
                <div className="relative my-6 flex w-full" key={name}>
                  {fieldComponents[fields[name]!.kind]({ name, ...fields[name]! })}
                </div>
              );
            })}
          </div>
        ))}
      </form>
    </FormContext.Provider>
  );
};
