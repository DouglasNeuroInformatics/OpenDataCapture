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

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  const handleFocus = () => {
    return; // console.log('focus');
  };

  const handleBlur = () => {
    if (!isValidDate(value)) {
      setValue('');
    }
  };

  return (
    <div>
      <input
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
