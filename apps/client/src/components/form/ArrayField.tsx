import React, { useLayoutEffect } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { PrimitiveField } from './PrimitiveField';
import { FormDataRecord, FormFields } from './types';

import { Button } from '@/components/base';

export interface ArrayFieldProps {
  kind: 'array';
  name: string;
  fieldset: FormFields<FormDataRecord>;
}

export const ArrayField = ({ name, fieldset }: ArrayFieldProps) => {
  const { control } = useFormContext<Record<PropertyKey, FormDataRecord[]>>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: name
  });

  const handleAppend = () => {
    append(Object.fromEntries(Object.keys(fieldset).map((key) => [key, ''])));
  };

  const handleRemove = () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
    }
  };

  // This is probably a bad way of doing this, consider changing later
  useLayoutEffect(() => {
    replace(Object.fromEntries(Object.keys(fieldset).map((key) => [key, ''])));
  }, [fieldset, replace]);

  return (
    <React.Fragment>
      {fields.map(({ id, ...entries }, index) => (
        <section key={id}>
          <h5 className="mt-5 text-lg font-semibold italic">Item {index + 1}</h5>
          {Object.keys(entries).map((key) => {
            const props = fieldset[key]!;
            return <PrimitiveField key={key} name={`${name}.${index}.${key}`} {...props} />;
          })}
        </section>
      ))}
      <div className="mb-5 flex gap-5">
        <Button label="Append" type="button" onClick={handleAppend} />
        <Button label="Remove" type="button" onClick={handleRemove} />
      </div>
    </React.Fragment>
  );
};
