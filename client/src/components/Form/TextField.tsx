import React, { useState } from 'react';

import classNames from 'classnames';
import { UseFormRegister } from 'react-hook-form';

import Field from './Field';

interface TextFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: string;
  variant?: 'date' | 'text' | 'password';
}

const TextField = ({ name, label, register, error, variant = 'text' }: TextFieldProps) => {
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (!event.currentTarget.value) {
      setIsFloatingLabel(false);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsFloatingLabel(true);
  };

  return (
    <Field error={error}>
      <input
        className="w-full border-b-2 bg-transparent py-2 text-gray-900 hover:border-gray-300 focus:border-indigo-800 focus:outline-none"
        type={variant}
        onFocus={handleFocus}
        {...register(name, { onBlur: handleBlur })}
      />
      <label
        className={classNames('absolute left-0 -z-50 my-2 text-gray-600 transition-all', {
          '-translate-y-5 text-sm text-indigo-800': isFloatingLabel
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </Field>
  );
};

export { TextField as default, type TextFieldProps };
