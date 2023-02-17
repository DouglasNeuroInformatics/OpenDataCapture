import React from 'react';

import { DateField } from '../DateField';
import { SelectField } from '../SelectField';
import { TextField } from '../TextField';
import { FormDataType, FormFields } from '../types';

export interface FormGroupProps<T extends FormDataType> {
  title?: string;
  fields: FormFields<T>[0]['fields'];
}

export const FormGroup = <T extends FormDataType>({ title, fields }: FormGroupProps<T>) => {
  return (
    <div>
      {title && <h3>{title}</h3>}
      {Object.keys(fields).map((name) => {
        const props = fields[name];
        switch (props?.kind) {
          case undefined:
            return null;
          case 'text':
            return <TextField key={name} name={name} {...props} />;
          case 'select':
            return <SelectField key={name} name={name} {...props} />;
          case 'date':
            return <DateField key={name} name={name} {...props} />;
        }
      })}
    </div>
  );
};
