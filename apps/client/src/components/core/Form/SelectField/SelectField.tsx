import React from 'react';

import { Listbox } from '@headlessui/react';
import { clsx } from 'clsx';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';

export interface SelectFieldProps {
  kind: 'select';
  name: string;
  label: string;
  options: readonly string[];
}

export const SelectField = ({ name, label, options }: SelectFieldProps) => {
  const { field, formState } = useController<Record<string, string>>({ name });

  return (
    <React.Fragment>
      <Listbox as="div" className="field-container" name={name} value={field.value} onChange={field.onChange}>
        <Listbox.Button className="field-input">{field.value}</Listbox.Button>
        <Listbox.Label
          className={clsx('field-label ui-open:field-label-floating', {
            'field-label-floating': field.value
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
      <ErrorMessage error={formState.errors[name]} />
    </React.Fragment>
  );
};
