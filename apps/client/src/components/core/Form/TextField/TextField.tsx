import React, { useCallback, useState } from 'react';

import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';

export interface TextFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  name: string;
  label: string;
  type: 'text' | 'password';
}

export const TextField = ({ className, name, label, type, onBlur, onFocus, ...props }: TextFieldProps) => {
  const { register, formState } = useFormContext();
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);

  const inputRef = useCallback((e: HTMLInputElement | null) => {
    if (e && e.value) {
      setIsFloatingLabel(true);
    }
  }, []);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (!event.currentTarget.value) {
      setIsFloatingLabel(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    setIsFloatingLabel(true);
    if (onFocus) {
      onFocus(event);
    }
  };

  const { ref, ...rest } = register(name, { onBlur: handleBlur });

  return (
    <div className="field-container">
      <input
        autoComplete="off"
        className={clsx('field-input', className)}
        type={type}
        onFocus={handleFocus}
        {...rest}
        ref={(e) => {
          ref(e);
          inputRef(e);
        }}
        {...props}
      />
      <label
        className={clsx('field-label', {
          'field-label-floating': isFloatingLabel
        })}
        htmlFor={name}
      >
        {label}
      </label>
      <ErrorMessage error={formState.errors[name]} />
    </div>
  );
};
