import React, { useState } from 'react';

import { clsx } from 'clsx';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import Select from 'react-select';

import { FieldElement } from './FieldElement';

export interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
  control: Control<any>;
  register: UseFormRegister<any>;
  error?: string;
}

export const SelectField = ({ name, label, options, control, error }: SelectFieldProps) => {
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);
  const selectOptions = options.map((option) => ({ value: option, label: option }));
  return (
    <FieldElement error={error} isFloatingLabel={isFloatingLabel} label={label} name={name}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          if (value) {
            setIsFloatingLabel(true);
          }
          return (
            <Select
              unstyled
              classNames={{
                control: ({ isFocused, menuIsOpen }) => {
                  return clsx('w-full border-b-2 bg-transparent py-2 text-gray-900', {
                    'border-indigo-800 outline-none': isFocused || menuIsOpen,
                    'hover:border-gray-300': !menuIsOpen
                  });
                },
                menu: () => clsx('mt-1 bg-slate-100 shadow-xl rounded-md'),
                option: () => 'p-2 hover:bg-slate-200 capitalize'
              }}
              name={name}
              options={selectOptions}
              placeholder={null}
              value={selectOptions.find((c) => c.value === value)}
              onBlur={() => (value ? null : setIsFloatingLabel(false))}
              onChange={(selectedOption) => {
                selectedOption && onChange(selectedOption.value);
              }}
              onFocus={() => setIsFloatingLabel(true)}
            />
          );
        }}
      />
    </FieldElement>
  );
};
