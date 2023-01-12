import React from 'react';

import { UseFormRegister } from 'react-hook-form';

import Field from './Field';

interface DateFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: string;
}

const DateField = ({ name, label, register, error }: DateFieldProps) => {
  return (
    <Field error={error}>
      <input
        className="w-full border-b-2 bg-transparent py-2 text-gray-900 hover:border-gray-300 focus:border-indigo-800 focus:outline-none"
        type="date"
        {...register(name)}
      />
      <label htmlFor={name}>{label}</label>
    </Field>
  );
};

export { DateField as default, type DateFieldProps };
