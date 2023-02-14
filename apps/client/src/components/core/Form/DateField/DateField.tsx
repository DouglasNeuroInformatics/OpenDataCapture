import React from 'react';

import DatePicker from 'react-datepicker';
import { useController } from 'react-hook-form';

import { FormDataType } from '../types';

import 'react-datepicker/dist/react-datepicker.css';

export interface DateFieldProps {
  name: string;
  label: string;
}

export const DateField = ({ name }: DateFieldProps) => {
  const { field, formState } = useController<FormDataType>({ name, defaultValue: '' });

  const handleChange = () => {
    field.onChange;
  };

  return <DatePicker className="field-input" dateFormat="yyyy-MM-dd" value={field.value} onChange={field.onChange} />;
};
