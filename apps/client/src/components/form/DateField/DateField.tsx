import React, { useEffect, useState } from 'react';

import { clsx } from 'clsx';
import { DateUtils } from 'common';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FormDataType } from '../types';

import { DatePicker } from './DatePicker';

import { TransitionOpacity } from '@/components/transitions';

export interface DateFieldProps {
  kind: 'date';
  name: string;
  label: string;
}

export const DateField = ({ name, label }: DateFieldProps) => {
  const [inputFocused, setInputFocused] = useState(false);
  const [mouseInDatePicker, setMouseInDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { field, formState } = useController<FormDataType>({ name, defaultValue: '' });

  useEffect(() => {
    setShowDatePicker(inputFocused || mouseInDatePicker);
  }, [inputFocused, mouseInDatePicker]);

  const handleDatePickerSelection = (date: Date) => {
    field.onChange(DateUtils.toBasicISOString(date));
    setShowDatePicker(false);
  };

  const isFloatingLabel = showDatePicker || field.value;

  return (
    <React.Fragment>
      <div className="field-container">
        <input
          autoComplete="off"
          className="field-input"
          value={field.value}
          onBlur={() => setInputFocused(false)}
          onFocus={() => setInputFocused(true)}
        />
        <label
          className={clsx('field-label', {
            'field-label-floating': isFloatingLabel
          })}
          htmlFor={name}
        >
          {label}
        </label>
        <ErrorMessage error={formState.errors[name]} />
        <TransitionOpacity show={showDatePicker}>
          <DatePicker
            onMouseEnter={() => setMouseInDatePicker(true)}
            onMouseLeave={() => setMouseInDatePicker(false)}
            onSelection={handleDatePickerSelection}
          />
        </TransitionOpacity>
      </div>
    </React.Fragment>
  );
};
