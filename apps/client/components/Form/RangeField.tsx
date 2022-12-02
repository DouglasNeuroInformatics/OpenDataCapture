import React from 'react';

import { useField } from 'formik';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { FormFieldProps } from './types';

const RangeField = (props: FormFieldProps) => {
  const [field, meta] = useField(props);
  const tooltip = <Tooltip id={`tooltip-field`}>{field.value || 'NA'}</Tooltip>;

  return (
    <div className="form-group mb-3">
      <label htmlFor={field.name}>{props.label}</label>
      <OverlayTrigger overlay={tooltip} placement="bottom">
        <input {...field} {...props} className="form-range" max="10" min="0" type="range"></input>
      </OverlayTrigger>
      {meta.touched && meta.error && <div className="alert alert-danger">{meta.error}</div>}
    </div>
  );
};

export default RangeField;
