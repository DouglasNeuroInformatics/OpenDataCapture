import React from 'react';

import { NumericFormField } from '@douglasneuroinformatics/common';
import { clsx } from 'clsx';

import { FormFieldContainer } from './FormFieldContainer';
import { FormFieldDescription } from './FormFieldDescription';
import { BaseFieldProps } from './types';

export type NumericFieldProps = BaseFieldProps<number | null> & NumericFormField;

export const NumericField = ({
  description,
  name,
  label,
  min,
  max,
  error,
  value,
  setValue,
  variant
}: NumericFieldProps) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = parseFloat(event.target.value);
    if (Number.isNaN(newValue)) {
      setValue(null);
    } else if (newValue >= min && newValue <= max) {
      setValue(newValue);
    }
  };

  return (
    <FormFieldContainer description={variant === 'default' ? description : undefined} error={error}>
      {variant === 'default' && (
        <>
          <input
            className="field-input peer"
            max={max}
            min={min}
            name={name}
            type="text"
            value={value ?? ''}
            onChange={handleChange}
          />
          <label
            className={clsx('field-label field-label-floating peer-focus:field-label-floating--active', {
              'field-label-floating--active': value !== null
            })}
            htmlFor={name}
          >
            {label}
          </label>
        </>
      )}
      {variant === 'slider' && (
        <>
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
              value={value ?? min}
              onChange={handleChange}
            />
            <div className="flex items-center justify-center text-gray-600">{value ?? min}</div>
            <FormFieldDescription description={description} />
          </div>
        </>
      )}
    </FormFieldContainer>
  );
};
