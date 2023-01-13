import React, { useState } from 'react';

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
    <Field error={error} isFloatingLabel={isFloatingLabel} label={label} name={name}>
      <input className="input" type={variant} onFocus={handleFocus} {...register(name, { onBlur: handleBlur })} />
    </Field>
  );
};

export { TextField as default, type TextFieldProps };
