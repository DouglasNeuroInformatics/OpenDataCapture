import React, { useMemo } from 'react';

import { useController } from 'react-hook-form';

import { DistributiveOmit, FieldValue, FormDataRecord } from '../types';

import { DateField, DateFieldProps } from './DateField';
import { ErrorMessage } from './ErrorMessage';
import { FieldDescription } from './FieldDescription';
import { SelectField, SelectFieldProps } from './SelectField';
import { TextField, TextFieldProps } from './TextField';

export type PrimitiveFieldProps<T extends FieldValue = FieldValue> = DistributiveOmit<
  DateFieldProps | SelectFieldProps<T> | TextFieldProps,
  'onChange' | 'value'
>;

export const PrimitiveField = ({ name, description, ...props }: PrimitiveFieldProps<FieldValue>) => {
  const { field, fieldState } = useController<FormDataRecord>({ name, defaultValue: '' });

  const element = useMemo(() => {
    switch (props.kind) {
      case 'text':
        return <TextField key={name} name={name} value={field.value} onChange={field.onChange} {...props} />;
      case 'select':
        return <SelectField key={name} name={name} value={field.value} onChange={field.onChange} {...props} />;
      case 'date':
        return <DateField key={name} name={name} value={field.value} onChange={field.onChange} {...props} />;
    }
  }, [name, props, field]);

  return (
    <React.Fragment>
      <div className="relative my-6 flex w-full ">
        <div className="flex flex-grow flex-col">{element}</div>
        <FieldDescription description={description} />
      </div>
      <ErrorMessage error={fieldState.error} />
    </React.Fragment>
  );
};
