import React from 'react';

import { PrimitiveFormField as TPrimitiveFormField } from '@ddcp/common';

import { BinaryField } from './BinaryField';
import { DateField } from './DateField';
import { NumericField } from './NumericField';
import { OptionsField } from './OptionsField';
import { TextField } from './TextField';
import { BaseFieldProps } from './types';

export const PrimitiveFormField = (props: BaseFieldProps<TPrimitiveFormField>) => {
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
