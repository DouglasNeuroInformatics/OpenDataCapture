import React, { useState } from 'react';

import classNames from 'classnames';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import Select from 'react-select';

import Field from './Field';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
  control: Control<any>;
  register: UseFormRegister<any>;
  error?: string;
}

const SelectField = ({ name, label, options, control, register, error }: SelectFieldProps) => {
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [value, setValue] = useState<string>('');

  const handleBlur: React.FocusEventHandler<HTMLSelectElement> = (event) => {
    if (!event.currentTarget.value) {
      setIsFloatingLabel(false);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLSelectElement> = () => {
    setIsFloatingLabel(true);
    setIsDropdownOpen(true);
  };

  const selectOptions = options.map((option) => ({ value: option, label: option }));

  return (
    <Field error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Select
            options={selectOptions}
            value={selectOptions.find((c) => c.value === value)}
            onChange={(selectedOption) => {
              selectedOption && onChange(selectedOption.value);
            }}
          />
        )}
      />
    </Field>
  );

  /*


  return (
    <Field error={error}>
      <select
        className="w-full border-b-2 bg-transparent py-2 text-gray-900 hover:border-gray-300 focus:border-indigo-800 focus:outline-none"
        onFocus={handleFocus}
        {...register(name, { onBlur: handleBlur })}
      >
        {options.map((option) => (
          <option key={option} value={value}>
            {option}
          </option>
        ))}
      </select>
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
  */
};

export { SelectField as default, type SelectFieldProps };
