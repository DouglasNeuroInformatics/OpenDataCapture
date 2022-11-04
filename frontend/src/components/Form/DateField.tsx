import React from 'react';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { type FieldProps } from 'formik';

interface DateFieldProps extends FieldProps<string> {
  label: string
  startDate: Date
}

const DateField: React.FunctionComponent<DateFieldProps> = ({
  field,
  form,
  label,
  ...props
}) => {
  const selected = new Date(field.value);

  return (
    <div className='form-group mb-3'>
      <label htmlFor={field.name}>{label}</label>
      <ReactDatePicker selected={selected} className='form-control w-100' {...field} {...props} />
    </div>
  );
};

export default DateField;