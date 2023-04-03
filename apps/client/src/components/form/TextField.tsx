import React from 'react';

import { TextFormField } from '@ddcp/common';
import { clsx } from 'clsx';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

import { useFormField } from '@/hooks/useFormField';

type TextFieldProps = BaseFieldProps<TextFormField>;

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { value } = useFormField<string>(name);

  return (
    <FormFieldContainer>
      {variant === 'short' || variant === 'password' ? (
        <input
          autoComplete="off"
          className="field-input peer"
          name={name}
          type={variant === 'short' ? 'text' : 'password'}
          value={value}
        />
      ) : (
        <textarea autoComplete="off" className="field-input peer" rows={5} value={value} />
      )}
      <label
        className={clsx('field-label peer-focus:field-label-floating', {
          'field-label-floating': value
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </FormFieldContainer>
  );
};
