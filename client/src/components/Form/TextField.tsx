import React, { useState } from 'react';

import classNames from 'classnames';

import Field from './Field';

interface TextFieldProps {
  name: string;
  label: string;
  id?: string;
  variant?: 'text' | 'password';
}

const TextField = ({ name, label, id, variant = 'text' }: TextFieldProps) => {
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
    <Field>
      <input
        className="border-b-2 bg-transparent py-2 text-gray-900 hover:border-gray-300 focus:border-indigo-800 focus:outline-none"
        id={id ?? name}
        name={name}
        type={variant}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      <label
        className={classNames('absolute left-0 -z-50 my-2 text-gray-600 transition-all', {
          '-translate-y-6 text-sm text-indigo-800': isFloatingLabel
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </Field>
  );
};

export { TextField as default, type TextFieldProps };
