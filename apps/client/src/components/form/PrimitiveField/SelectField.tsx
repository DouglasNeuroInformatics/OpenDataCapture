import React from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

import { BaseFieldProps, FieldValue } from '../types';

export interface SelectFieldProps<T extends FieldValue> extends BaseFieldProps {
  kind: 'select';
  options: T[];
  value: T;
  onChange: (value: T) => void;
}

export const SelectField = <T extends FieldValue = string>({
  name,
  label,
  options,
  value,
  onChange
}: SelectFieldProps<T>) => {
  return (
    <Listbox as={React.Fragment} name={name} value={value} onChange={onChange}>
      <Listbox.Button className="field-input capitalize">{value}</Listbox.Button>
      <Listbox.Label
        className={clsx('field-label ui-open:field-label-floating', {
          'field-label-floating': value
        })}
      >
        {label}
      </Listbox.Label>
      <Transition
        as="div"
        className="relative inline-block"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-slate-50 shadow-md">
          {options.map((option) => (
            <Listbox.Option className="p-2 capitalize hover:bg-slate-200" key={option} value={option}>
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};
