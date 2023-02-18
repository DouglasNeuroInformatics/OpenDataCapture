import React from 'react';

import { clsx } from 'clsx';

import { BaseFieldProps, FieldValue } from '../types';

type TextFieldVariant = 'short' | 'long' | 'password';

const InputElement = ({ type, value, onChange }: React.HTMLProps<HTMLInputElement>) => (
  <input autoComplete="off" className="field-input peer" type={type} value={value} onChange={onChange} />
);

const TextAreaElement = ({ value, onChange }: React.HTMLProps<HTMLTextAreaElement>) => (
  <textarea autoComplete="off" className="field-input peer" rows={5} value={value} onChange={onChange} />
);

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: TextFieldVariant;
  onChange: React.ChangeEventHandler<any>;
  value: FieldValue;
}

export const TextField = ({ name, label, variant, value, onChange }: TextFieldProps) => {
  return (
    <div className="field-container">
      {variant === 'short' || variant === 'password' ? (
        <InputElement type={variant === 'short' ? 'text' : 'password'} value={value} onChange={onChange} />
      ) : (
        <TextAreaElement value={value} onChange={onChange} />
      )}
      <label
        className={clsx('field-label peer-focus:field-label-floating', {
          'field-label-floating': value
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </div>
  );
};
