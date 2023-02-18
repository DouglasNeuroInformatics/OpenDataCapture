import React from 'react';

import { useFieldArray } from 'react-hook-form';

import { TextField } from './TextField';
import { FormDataRecord, FormFields } from './types';

import { Button } from '@/components/base';

export interface ArrayFieldProps<T extends FormDataRecord[]> {
  kind: 'array';
  name: string;
  itemFields: FormFields<T[number]>;
}

export const ArrayField = <T extends FormDataRecord[]>({ name }: ArrayFieldProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    name: name
  });

  const appendField = () => {
    append({
      name: '',
      amount: ''
    });
  };

  const removeLastField = () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
    }
  };

  return (
    <React.Fragment>
      {fields.map((field, index) => (
        <section key={field.id}>
          <TextField kind="text" label="Name" name={`cart.${index}.name`} variant="short" />
          <TextField kind="text" label="Amount" name={`cart.${index}.amount`} variant="short" />
        </section>
      ))}
      <div className="mb-5 flex gap-5">
        <Button label="Append" type="button" onClick={appendField} />
        <Button label="Remove" type="button" onClick={removeLastField} />
      </div>
    </React.Fragment>
  );
};
