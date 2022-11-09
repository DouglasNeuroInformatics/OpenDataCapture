import React from 'react';

import { type FieldProps } from 'formik';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


interface RangeFieldProps extends FieldProps<string> {
  label: string;
}

const RangeField: React.FunctionComponent<RangeFieldProps> = ({ field, form, label, ...props }) => {

  const tooltip = (
    <Tooltip id={`tooltip-field`}>
      {field.value || "Slide to set your happiness score"}
    </Tooltip>
  )

  return (
    <div className="form-group mb-3">
      <Form.Label htmlFor={field.name}>{label}</Form.Label>
      <OverlayTrigger placement="bottom-start" overlay={tooltip}>
        <Form.Range min="0" max="10" {...field} {...props} />
      </OverlayTrigger>
      {form.touched[field.name] && form.errors[field.name] && (
        <div className="alert alert-danger">{form.errors[field.name] as string}</div>
      )}
    </div>
  );
};

export default RangeField;
