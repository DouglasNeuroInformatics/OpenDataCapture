import React from 'react';

import { clsx } from 'clsx';

import { useField } from '../hooks/useField';
import { BaseFieldProps } from '../types';

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { props, helpers } = useField<HTMLInputElement | HTMLTextAreaElement, string>(name);

  return (
    <>
      {variant === 'long' ? (
        <textarea autoComplete="off" className="field-input" rows={5} {...props} />
      ) : (
        <input autoComplete="off" className="field-input" type={variant} {...props} />
      )}
      <label
        className={clsx('field-label', {
          'field-label-floating': props.value || helpers.isFocused
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </>
  );
};
