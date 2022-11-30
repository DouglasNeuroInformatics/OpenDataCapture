import React from 'react';

import { useField } from 'formik';

import { FormFieldProps } from './types';

const TextField = (props: FormFieldProps) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{props.label}</label>
      <input {...field} {...props} className="form-control" type="text" />
      {meta.touched && meta.error && <div className="alert alert-danger">{meta.error}</div>}
    </div>
  );
};

export default TextField;
