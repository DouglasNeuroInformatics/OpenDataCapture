import React from 'react';

import { type FieldProps } from 'formik';

interface SelectFieldProps extends FieldProps<string> {
  label: string;
  options: { [key: string]: string };
}

// the type of field props should be set as union of possible
const SelectField: React.FunctionComponent<SelectFieldProps> = ({
  field,
  form,
  label,
  options,
  ...props
}) => {
  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{label}</label>
      <select {...field} {...props} className="form-select" defaultValue="">
        <option disabled value="">
          Please select
        </option>
        {Object.entries(options).map(([key, value]) => (
          <option key={key} value={value}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
