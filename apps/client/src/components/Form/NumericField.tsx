import React from 'react';

import { NumericFormField } from '@ddcp/common';

import { FormFieldContainer } from './FormFieldContainer';
import { FormFieldDescription } from './FormFieldDescription';
import { BaseFieldProps } from './types';

export type NumericFieldProps = BaseFieldProps<number | null> & NumericFormField;

export const NumericField = ({ description, name, label, min, max, error, value, setValue }: NumericFieldProps) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(Number(event.target.value));
  };

  const displayValue = value ?? min;

  return (
    <FormFieldContainer error={error}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className="flex gap-3">
        <input
          className="field-input-base"
          max={max}
          min={min}
          name={name}
          type="range"
          value={displayValue}
          onChange={handleChange}
        />
        <div className="flex items-center justify-center text-gray-600">{displayValue}</div>
        <FormFieldDescription description={description} />
      </div>
    </FormFieldContainer>
  );
};
