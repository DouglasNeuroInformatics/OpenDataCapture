import React, { useState } from 'react';

import { DatePicker } from './DatePicker';

function isValidDate(s: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(s);
}

export interface DateFieldProps {
  name: string;
}

export const DateField = ({ name }: DateFieldProps) => {
  const [value, setValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  const handleFocus = () => {
    setShowDatePicker(true);
  };

  const handleBlur = () => {
    setShowDatePicker(false);
    if (!isValidDate(value)) {
      setValue('');
    }
  };

  return (
    <div>
      <input
        autoComplete="off"
        className="input"
        name={name}
        type="text"
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    </div>
  );
};
