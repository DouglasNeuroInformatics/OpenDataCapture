import React, { HTMLInputTypeAttribute, useCallback, useState } from 'react';

import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';

export interface TextFieldProps {
  kind: 'text';
  name: string;
  label: string;
  variant: 'short' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { register, formState } = useFormContext();
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);

  const type = (variant === 'short' ? 'text' : 'password') satisfies HTMLInputTypeAttribute;

  const inputRef = useCallback((e: HTMLInputElement | null) => {
    if (e && e.value) {
      setIsFloatingLabel(true);
    }
  }, []);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (!event.currentTarget.value) {
      setIsFloatingLabel(false);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsFloatingLabel(true);
  };

  const { ref, ...rest } = register(name, { onBlur: handleBlur });

  return (
    <div className="field-container">
      <input
        autoComplete="off"
        className="field-input"
        type={type}
        onFocus={handleFocus}
        {...rest}
        ref={(e) => {
          ref(e);
          inputRef(e);
        }}
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
