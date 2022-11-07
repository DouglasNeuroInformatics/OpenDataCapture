import React from 'react';
import { useField, useFormikContext } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  name: string,
  label: string
}

export const DateField = (props: DateFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);
  return (
    <div className='form-group mb-3'>
      <label htmlFor={field.name}>{props.label}</label>
      <DatePicker
        {...field}
        {...props}
        className='form-control w-100'
        dateFormat='yyyy-MM-dd'
        placeholderText="YYYY-MM-DD"
        selected={(field.value && new Date(field.value)) || null}
        onChange={value => {
          setFieldValue(field.name, value);
        }}
      />
    </div>
  );
};

export default DateField;