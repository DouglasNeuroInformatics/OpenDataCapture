import React, { useState } from 'react';

import { Listbox } from '@headlessui/react';
import { clsx } from 'clsx';

export interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
}

export const SelectField = ({ name, label, options }: SelectFieldProps) => {
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <Listbox as="div" className="field-container" name={name} value={selectedOption} onChange={setSelectedOption}>
      <Listbox.Button className="field-input">{selectedOption}</Listbox.Button>
      <Listbox.Label
        className={clsx('field-label ui-open:field-label-floating', {
          'field-label-floating': selectedOption
        })}
      >
        {label}
      </Listbox.Label>
      <Listbox.Options>
        {options.map((option) => (
          <Listbox.Option key={option} value={option}>
            {option}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
};
