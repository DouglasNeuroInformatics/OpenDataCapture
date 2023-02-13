import React, { type HTMLInputTypeAttribute } from 'react';

import { clsx } from 'clsx';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FormDataType } from '../types';

export interface TextFieldProps {
  kind: 'text';
  name: string;
  label: string;
  variant: 'short' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { field, formState } = useController<FormDataType>({ name, defaultValue: '' });

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
      <ErrorMessage error={formState.errors[name]} />
    </div>
  );
};
