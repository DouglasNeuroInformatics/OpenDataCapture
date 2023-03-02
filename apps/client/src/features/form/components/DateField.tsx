import React, { useEffect, useState } from 'react';

import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { DateUtils } from 'common';

import { useField } from '../hooks/useField';
import { BaseFieldProps } from '../types';

import { DatePicker } from '@/components/core';

export interface DateFieldProps extends BaseFieldProps {
  kind: 'date';
}

export const DateField = ({ name, label }: DateFieldProps) => {
  const { props, helpers } = useField<HTMLInputElement, string>(name);

  const [mouseInDatePicker, setMouseInDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setShowDatePicker(helpers.isFocused || mouseInDatePicker);
  }, [helpers.isFocused, mouseInDatePicker]);

  const handleDatePickerSelection = (date: Date) => {
    helpers.setValue(DateUtils.toBasicISOString(date));
    setShowDatePicker(false);
  };

  return (
    <React.Fragment>
      <input autoComplete="off" className="field-input" {...props} />
      <label
        className={clsx('field-label', {
          'field-label-floating': showDatePicker || props.value
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
