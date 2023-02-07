import React from 'react';

import { useFormContext } from 'react-hook-form';

export interface TextFieldProps {
  name: string;
}

export const TextField = ({ name }: TextFieldProps) => {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col">
      <input {...register(name)} type="text" />
      <label htmlFor={name}>{name}</label>
    </div>
  );
};
