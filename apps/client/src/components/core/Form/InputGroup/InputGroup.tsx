import React, { useCallback, useState } from 'react';

import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';

import { TransitionOpacity } from '@/components/transitions';

type InputType = Extract<React.HTMLInputTypeAttribute, 'text' | 'password' | 'button'>;

export interface InputGroupProps extends React.ComponentPropsWithoutRef<'input'> {
  name: string;
  label: string;
  type: InputType;
  selector?: JSX.Element;
  showSelector?: boolean;
}

export const InputGroup = ({
  className,
  name,
  label,
  type,
  selector,
  showSelector,
  onBlur,
  onFocus,
  ...props
}: InputGroupProps) => {
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
    <div className="relative my-6 flex w-full flex-col">
      <input
        autoComplete="off"
        className={clsx('input', className)}
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
        className={clsx('pointer-events-none absolute left-0 my-2 text-gray-600 transition-all', {
          'z-10 -translate-y-5 text-sm text-indigo-800': isFloatingLabel
        })}
        htmlFor={name}
      >
        {label}
      </label>
      {selector && <TransitionOpacity show={showSelector}>{selector}</TransitionOpacity>}
      <ErrorMessage error={formState.errors[name]} />
    </div>
  );
};
