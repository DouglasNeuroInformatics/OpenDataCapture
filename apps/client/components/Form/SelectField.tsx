import React from 'react';

import { useField } from 'formik';

import { FormFieldProps } from './types';

const SelectField = (props: FormFieldProps) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{props.label}</label>
      <select {...field} {...props} className="form-select" defaultValue="">
        <option disabled value="">
          Please select
        </option>
        {props.options &&
          Object.entries(props.options).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
      </select>
      {meta.touched && meta.error && <div className="alert alert-danger">{meta.error}</div>}
    </div>
  );
};

export default SelectField;
