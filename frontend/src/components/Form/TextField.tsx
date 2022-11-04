import React from 'react';

import { type FieldProps } from 'formik';

const TextField: React.FunctionComponent<FieldProps<string>> = ({
  field,
  form,
  ...props
}) => {
  return (
    <div className='form-group mb-3'>
      <label htmlFor={field.name}>{field.name}</label>
      <input className="form-control" {...field} {...props} />
      {form.touched[field.name] &&
        form.errors[field.name] && (
        <div className="alert alert-danger">{form.errors[field.name] as string}</div>
      )}
    </div>
  );
};

export default TextField;