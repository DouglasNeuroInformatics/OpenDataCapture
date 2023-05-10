import React from 'react';

import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { HiChevronDown } from 'react-icons/hi2';

import { Button, type ButtonProps } from '@/components';

type DropdownOptions = readonly string[] | Record<string, string>;

type DropdownOptionKey<T> = T extends readonly string[]
  ? T[number]
  : T extends Record<string, string>
  ? Extract<keyof T, string>
  : never;

export interface DropdownProps<T extends DropdownOptions> {
  /** The text content for the dropdown toggle */
  title: string;

  /** Either a list of options for the dropdown, or an object with options mapped to custom labels  */
  options: T;

  /** Callback function invoked when user clicks an option */
  onSelection: (option: DropdownOptionKey<T>) => void;

  /** The button variant to use for the dropdown toggle */
  variant?: ButtonProps['variant'];

  className?: string;
}

// eslint-disable-next-line react/function-component-definition
export function Dropdown<const T extends DropdownOptions>({
  title,
  options,
  onSelection,
  variant,
  className
}: DropdownProps<T>) {
  const optionKeys: readonly string[] = options instanceof Array ? options : Object.keys(options);
  return (
    <Menu as="div" className={clsx('relative w-full whitespace-nowrap', className)}>
      <Menu.Button
        as={Button}
        className="h-full w-full"
        disabled={options.length === 0}
        icon={<HiChevronDown />}
        iconPosition="right"
        label={title}
        style={{ width: '100%' }}
        variant={variant}
      />
      <Transition
        as="div"
        className="absolute bottom-0 z-10 w-full"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-2 flex w-fit min-w-full flex-col border">
          {optionKeys.map((option) => (
            <Menu.Item key={option}>
              <button
                className="bg-slate-50 p-2 text-left hover:bg-slate-200"
                style={{ minWidth: 100 }}
                onClick={() => onSelection(option as DropdownOptionKey<T>)}
              >
                {Array.isArray(options) ? option : (options[option as keyof T] as string)}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
