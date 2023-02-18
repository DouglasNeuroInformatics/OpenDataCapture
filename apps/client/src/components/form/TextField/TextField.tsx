import React, { type HTMLInputTypeAttribute } from 'react';

import { clsx } from 'clsx';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { BaseFieldProps, FormDataRecord } from '../types';

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: 'short' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { field, fieldState } = useController<FormDataRecord>({ name, defaultValue: '' });
  const type = (variant === 'short' ? 'text' : 'password') satisfies HTMLInputTypeAttribute;

  return (
    <div className="field-container">
      <input
        autoComplete="off"
        className="field-input peer"
        type={type}
        value={field.value}
        onChange={field.onChange}
      />
      <label
        className={clsx('field-label peer-focus:field-label-floating', {
          'field-label-floating': field.value
        })}
        htmlFor={name}
      >
        {label}
      </label>
      <ErrorMessage error={fieldState.error} />
    </div>
  );
};
