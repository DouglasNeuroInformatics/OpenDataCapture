import React, { useCallback, useState } from 'react';

import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from './ErrorMessage';

export type InputType = Extract<React.HTMLInputTypeAttribute, 'text' | 'password'>;

export interface InputGroupProps {
  name: string;
  label: string;
  type: InputType;
}

export const InputGroup = ({ name, label, type }: InputGroupProps) => {
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
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsFloatingLabel(true);
  };

  const { ref, ...rest } = register(name, { onBlur: handleBlur });

  return (
    <div className="relative my-6 flex w-full flex-col">
      <input
        autoComplete="off"
        className="input"
        type={type}
        onFocus={handleFocus}
        {...rest}
        ref={(e) => {
          ref(e);
          inputRef(e);
        }}
      />
      <label
        className={clsx('pointer-events-none absolute left-0 my-2 text-gray-600 transition-all', {
          'z-10 -translate-y-5 text-sm text-indigo-800': isFloatingLabel
        })}
        htmlFor={name}
      >
        {label}
      </label>
      <ErrorMessage error={formState.errors[name]} />
    </div>
  );
};
