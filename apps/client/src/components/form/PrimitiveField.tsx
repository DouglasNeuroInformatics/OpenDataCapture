import React from 'react';

import { DateField, DateFieldProps } from './DateField';
import { SelectField, SelectFieldProps } from './SelectField';
import { TextField, TextFieldProps } from './TextField';
import { FieldValue } from './types';

export type PrimitiveFieldProps<T extends FieldValue = FieldValue> =
  | DateFieldProps
  | SelectFieldProps<T>
  | TextFieldProps;

export const PrimitiveField = ({ name, ...props }: PrimitiveFieldProps<FieldValue>) => {
  switch (props.kind) {
    case 'text':
      return <TextField key={name} name={name} {...props} />;
    case 'select':
      return <SelectField key={name} name={name} {...props} />;
    case 'date':
      return <DateField key={name} name={name} {...props} />;
  }
};
