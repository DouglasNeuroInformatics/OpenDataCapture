import React from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { BaseFieldProps, FormDataType } from '../types';

export interface SelectFieldProps<T extends string> extends BaseFieldProps {
  kind: 'select';
  options: T[];
}

export const SelectField = <T extends string = string>({ name, label, options }: SelectFieldProps<T>) => {
  const { field, fieldState } = useController<FormDataType>({ name });

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
        <Transition
          as="div"
          className="relative inline-block"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-slate-50 shadow-md">
            {options.map((option) => (
              <Listbox.Option className="p-2 hover:bg-slate-200" key={option} value={option}>
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
      <ErrorMessage error={fieldState.error} />
    </React.Fragment>
  );
};
