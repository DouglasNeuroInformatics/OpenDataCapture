import React from 'react';

import { ArrayFormField } from '@douglasneuroinformatics/common';
import { Button } from '@douglasneuroinformatics/react-components';

import { PrimitiveFormField, PrimitiveFormFieldProps } from './PrimitiveFormField';
import { BaseFieldProps, NullableArrayFieldValue, NullablePrimitiveFieldValue } from './types';

export type ArrayFieldProps = BaseFieldProps<NullableArrayFieldValue> & ArrayFormField;

export const ArrayField = ({ label, fieldset, error, value: arrayValue, setValue: setArrayValue }: ArrayFieldProps) => {
  const appendField = () => {
    setArrayValue([...arrayValue, Object.fromEntries(Object.keys(fieldset).map((fieldName) => [fieldName, null]))]);
  };

  console.error(error);

  const removeField = () => {
    if (arrayValue.length > 1) {
      arrayValue.pop();
      setArrayValue(arrayValue);
    }
  };

  return (
    <div>
      {arrayValue.map((fields, i) => (
        <div key={i}>
          <span className="field-header">{label + ' ' + (i + 1)}</span>
          {Object.keys(fields).map((fieldName) => {
            const field = fieldset[fieldName];
            const fieldProps = field instanceof Function ? field(fields) : field;
            if (!fieldProps) {
              return null;
            }
            const props = {
              name: fieldName + i,
              error: error?.[i]?.[fieldName],
              value: fields[fieldName],
              setValue: (value: NullablePrimitiveFieldValue) => {
                const newArrayValue = [...arrayValue];
                newArrayValue[i][fieldName] = value;
                setArrayValue(newArrayValue);
              },
              ...fieldProps
            } as PrimitiveFormFieldProps;
            return <PrimitiveFormField key={fieldName} {...props} />;
          })}
        </div>
      ))}
      <div className="mb-5 flex gap-5">
        <Button label="Append" type="button" onClick={appendField} />
        <Button label="Remove" type="button" onClick={removeField} />
      </div>
    </div>
  );
};
