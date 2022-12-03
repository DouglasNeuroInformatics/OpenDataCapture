import React from 'react';

import Link from 'next/link';

import { useField, useFormikContext } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { FormFieldProps } from './types';

const DateField = (props: FormFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);
  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{props.label}</label>
      <DatePicker
        {...field}
        {...props}
        className="form-control w-100"
        dateFormat="yyyy-MM-dd"
        placeholderText="YYYY-MM-DD"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        selected={(field.value && new Date(field.value)) || null}
        onChange={(value) => {
          setFieldValue(field.name, value);
        }}
      />
      {meta.touched && meta.error && <div className="alert alert-danger">{meta.error}</div>}
    </div>
  );
};

export default DateField;
