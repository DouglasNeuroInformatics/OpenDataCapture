import React from 'react';

import { BinaryField, BinaryFieldProps } from './BinaryField';
import { DateField, DateFieldProps } from './DateField';
import { NumericField, NumericFieldProps } from './NumericField';
import { OptionsField, OptionsFieldProps } from './OptionsField';
import { TextField, TextFieldProps } from './TextField';

export type PrimitiveFormFieldProps =
  | TextFieldProps
  | NumericFieldProps
  | OptionsFieldProps
  | DateFieldProps
  | BinaryFieldProps;

export const PrimitiveFormField = (props: PrimitiveFormFieldProps) => {
  switch (props.kind) {
    case 'text':
      return <TextField key={props.name} {...props} />;
    case 'numeric':
      return <NumericField key={props.name} {...props} />;
    case 'options':
      return <OptionsField key={props.name} {...props} />;
    case 'date':
      return <DateField key={props.name} {...props} />;
    case 'binary':
      return <BinaryField key={props.name} {...props} />;
  }
};
