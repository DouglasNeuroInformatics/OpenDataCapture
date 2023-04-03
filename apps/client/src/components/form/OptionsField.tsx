import React from 'react';

import { OptionsFormField } from '@ddcp/common';
import { Listbox, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

import { useFormField } from '@/hooks/useFormField';

export type OptionsFieldProps<T extends string> = BaseFieldProps<OptionsFormField<T>>;

export const OptionsField = <T extends string = string>({ name, label, options }: OptionsFieldProps<T>) => {
  const { value, setValue } = useFormField<T>(name);

  return (
    <FormFieldContainer>
      <Listbox as={React.Fragment} name={name} value={value} onChange={setValue}>
        <Listbox.Button className="field-input capitalize">{options[value]}</Listbox.Button>
        <Listbox.Label
          className={clsx('field-label-floating ui-open:field-label-floating--active', {
            'field-label-floating--active': value
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
            {Object.keys(options).map((option) => (
              <Listbox.Option className="p-2 capitalize hover:bg-slate-200" key={option} value={option}>
                {options[option as T]}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </FormFieldContainer>
  );
};
