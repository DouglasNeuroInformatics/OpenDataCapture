import React from 'react';

import { BaseFieldProps } from '../types';

export interface SliderFieldProps extends BaseFieldProps {
  min: number;
  max: number;
  value: number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const SliderField = ({ name, value, onChange }: SliderFieldProps) => {
  return (
    <div className="field-container">
      <input
        className="range-thumb::foo w-full after:content-[foo]"
        name={name}
        type="range"
        value={value}
        onChange={onChange}
      />
      <div className="relative mr-5">
        <output
          className="absolute w-10 bg-red-500 text-center text-white"
          htmlFor={name}
          style={{ left: `${value}%` }}
        >
          {value}
        </output>
      </div>
    </div>
  );
};
