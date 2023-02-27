import React, { useContext } from 'react';

import { clsx } from 'clsx';

import { FormContext } from '../context/FormContext';
import { BaseFieldProps } from '../types';

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const formContext = useContext(FormContext);
  const value = formContext.values[name] as string;

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    return;
  };

  return (
    <>
      {variant === 'long' ? (
        <textarea autoComplete="off" className="field-input peer" rows={5} value={value} onChange={handleChange} />
      ) : (
        <input autoComplete="off" className="field-input peer" type={variant} value={value} onChange={handleChange} />
      )}
      <label
        className={clsx('field-label peer-focus:field-label-floating', {
          'field-label-floating': value
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </>
  );
};
