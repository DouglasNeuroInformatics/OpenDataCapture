import React, { useEffect, useState } from 'react';

import { DateUtils } from '@ddcp/common';
import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';

import { BaseFieldProps, FieldValue } from '../types';

import { DatePicker } from '@/components';

export interface DateFieldProps extends BaseFieldProps {
  kind: 'date';
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}

export const DateField = ({ name, label, value, onChange }: DateFieldProps) => {
  const [inputFocused, setInputFocused] = useState(false);
  const [mouseInDatePicker, setMouseInDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setShowDatePicker(inputFocused || mouseInDatePicker);
  }, [inputFocused, mouseInDatePicker]);

  const handleDatePickerSelection = (date: Date) => {
    onChange(DateUtils.toBasicISOString(date));
    setShowDatePicker(false);
  };

  const isFloatingLabel = showDatePicker || value;

  return (
    <React.Fragment>
      <input
        autoComplete="off"
        className="field-input"
        value={value}
        onBlur={() => setInputFocused(false)}
        onChange={(event) => onChange(event.target.value)}
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
      <Transition
        className="relative"
        enter="transition-opacity duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={showDatePicker}
      >
        <div className="absolute">
          <DatePicker
            onMouseEnter={() => setMouseInDatePicker(true)}
            onMouseLeave={() => setMouseInDatePicker(false)}
            onSelection={handleDatePickerSelection}
          />
        </div>
      </Transition>
    </React.Fragment>
  );
};
