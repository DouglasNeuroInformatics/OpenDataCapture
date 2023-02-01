import React, { useCallback, useEffect, useState } from 'react';

import { UseFormRegister } from 'react-hook-form';

import { FieldElement } from './FieldElement';

export interface TextFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: string;
  variant?: 'date' | 'text' | 'password';
}

export const TextField = ({ name, label, register, error, variant = 'text' }: TextFieldProps) => {
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);

  const inputRef = useCallback((e: HTMLInputElement | null) => {
    if (e && e.value) {
      setIsFloatingLabel(true);
    }
  }, []);

  useEffect(() => {
    console.log(inputRef);
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
    <FieldElement {...rest} error={error} isFloatingLabel={isFloatingLabel} label={label} name={name}>
      <input
        className="input"
        type={variant}
        onFocus={handleFocus}
        {...rest}
        ref={(e) => {
          ref(e);
          inputRef(e);
        }}
      />
    </FieldElement>
  );
};
