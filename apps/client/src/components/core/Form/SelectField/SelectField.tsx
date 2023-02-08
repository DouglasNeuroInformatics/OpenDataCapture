import React, { useState } from 'react';

import { InputGroup } from '../InputGroup';

interface OptionsDropdownProps {
  options: readonly string[];
  onSelection: (option: string) => void;
}

const OptionsDropdown = ({ options, onSelection }: OptionsDropdownProps) => {
  return (
    <ul>
      {options.map((option) => (
        <li key={option}>
          <button onClick={() => onSelection(option)}>{option}</button>
        </li>
      ))}
    </ul>
  );
};

export interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
}

export const SelectField = ({ name, label, options }: SelectFieldProps) => {
  const [selected, setSelected] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsOpen(false);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsOpen(true);
  };

  return (
    <InputGroup
      label={label}
      name={name}
      selector={<OptionsDropdown options={options} onSelection={setSelected} />}
      showSelector={isOpen}
      type="button"
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};
