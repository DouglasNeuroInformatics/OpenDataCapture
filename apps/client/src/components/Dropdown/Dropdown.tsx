import React from 'react';

import { Menu, Transition } from '@headlessui/react';
import { HiChevronDown } from 'react-icons/hi2';

import { Button, type ButtonProps } from '@/components';

export interface DropdownProps {
  title: string;
  options: string[];
  onSelection: (option: string) => void;
  variant?: ButtonProps['variant'];
}

export const Dropdown = ({ title, options, onSelection, variant }: DropdownProps) => {
  return (
    <Menu as="div" className="relative flex w-full">
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
        <Menu.Items className="absolute z-10 mt-2 flex w-full flex-col border">
          {options.map((option) => (
            <Menu.Item key={option}>
              <button
                className="w-full bg-slate-50 p-2 text-left hover:bg-slate-200"
                style={{ minWidth: 100 }}
                onClick={() => onSelection(option)}
              >
                {option}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
