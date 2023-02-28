import React from 'react';

import { clsx } from 'clsx';

import { useField } from '../hooks/useField';
import { BaseFieldProps } from '../types';

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const field = useField<string>(name);

  return (
    <>
      {variant === 'long' ? (
        <textarea autoComplete="off" className="field-input" rows={5} {...field} />
      ) : (
        <input autoComplete="off" className="field-input" type={variant} {...field} />
      )}
      <label
        className={clsx('field-label', {
          'field-label-floating': field.value || field.isFocused
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </>
  );
};
