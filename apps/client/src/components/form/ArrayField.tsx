import React from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { PrimitiveField } from './PrimitiveField';
import { FormDataRecord, FormFields } from './types';

import { Button } from '@/components/base';

export interface ArrayFieldProps {
  kind: 'array';
  name: string;
  itemFields: FormFields<FormDataRecord>;
}

export const ArrayField = ({ name, itemFields }: ArrayFieldProps) => {
  const { control } = useFormContext<Record<PropertyKey, FormDataRecord[]>>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name
  });

  const appendField = () => {
    append(Object.fromEntries(Object.keys(itemFields).map((key) => [key, ''])));
  };

  const removeLastField = () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
    }
  };

  return (
    <React.Fragment>
      {fields.map(({ id, ...entries }, index) => (
        <section key={id}>
          <h5 className="mt-5 text-lg font-semibold italic">Item {index + 1}</h5>
          {Object.keys(entries).map((key) => {
            const props = itemFields[key]!;
            return <PrimitiveField key={key} name={`${name}.${index}.${key}`} {...props} />;
          })}
        </section>
      ))}
      <div className="mb-5 flex gap-5">
        <Button label="Append" type="button" onClick={appendField} />
        <Button label="Remove" type="button" onClick={removeLastField} />
      </div>
    </React.Fragment>
  );
};
