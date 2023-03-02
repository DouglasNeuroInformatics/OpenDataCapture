import React, { useState } from 'react';

import { RadioGroup } from '@headlessui/react';

import { BaseFieldProps, FieldValue } from '../types';

export interface RadioFieldProps<T extends string> extends BaseFieldProps {
  value: T;
  onChange: (value: T) => void;
}

export const RadioField = <T extends string = string>({ name, value, onChange }: RadioFieldProps<T>) => {
  return (
    <RadioGroup value={value} onChange={onChange}>
      <RadioGroup.Label>Plan</RadioGroup.Label>
      <RadioGroup.Option value="startup">
        {({ checked }) => <span className={checked ? 'bg-blue-200' : ''}>Startup</span>}
      </RadioGroup.Option>
      <RadioGroup.Option value="business">
        {({ checked }) => <span className={checked ? 'bg-blue-200' : ''}>Business</span>}
      </RadioGroup.Option>
      <RadioGroup.Option value="enterprise">
        {({ checked }) => <span className={checked ? 'bg-blue-200' : ''}>Enterprise</span>}
      </RadioGroup.Option>
    </RadioGroup>
  );
};
