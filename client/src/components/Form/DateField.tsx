import React, { useState } from 'react';

import DatePicker from 'react-datepicker';
import { Control, Controller, UseFormRegister } from 'react-hook-form';

import 'react-datepicker/dist/react-datepicker.css';
import { FieldElement } from './FieldElement';

export interface DateFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  control: Control<any>;
  error?: string;
}

export const DateField = ({ name, label, control, error }: DateFieldProps) => {
  const [isFloatingLabel, setIsFloatingLabel] = useState(false);
  return (
    <FieldElement error={error} isFloatingLabel={isFloatingLabel} label={label} name={name}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            showYearDropdown
            className="input"
            dateFormat="yyyy-MM-dd"
            name={name}
            popperPlacement="bottom-start"
            selected={value as Date}
            startDate={null}
            value={value as string}
            onBlur={() => (value ? null : setIsFloatingLabel(false))}
            onChange={onChange}
            onFocus={() => setIsFloatingLabel(true)}
          />
        )}
      />
    </FieldElement>
  );
};
