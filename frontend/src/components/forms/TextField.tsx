import React from 'react';

import { type FieldProps } from 'formik';

interface TextFieldProps extends FieldProps<string> {
  label: string;
}

const TextField: React.FunctionComponent<TextFieldProps> = ({ field, form, label, ...props }) => {
  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{label}</label>
      <input className="form-control" {...field} {...props} />
      {form.touched[field.name] && form.errors[field.name] && (
        <div className="alert alert-danger">{form.errors[field.name] as string}</div>
      )}
    </div>
  );
};

export default TextField;
