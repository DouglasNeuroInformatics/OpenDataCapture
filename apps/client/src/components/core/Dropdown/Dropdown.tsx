import React from 'react';

import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { HiChevronDown } from 'react-icons/hi2';

import { Button } from '@/components/base';

export interface DropdownProps {
  btnLabel: string;
  children: React.ReactNode[];
}

export const Dropdown = ({ btnLabel, children }: DropdownProps) => {
  return (
    <Menu as="div" className="relative inline-block w-40 text-left">
      <Menu.Button as={Button} className="w-full" icon={<HiChevronDown />} iconPosition="right" label={btnLabel} />
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 flex w-full flex-col border">
          {children.map((child, i) => (
            <Menu.Item key={i}>
              <div className="w-full p-2" style={{ minWidth: 100 }}>
                {child}
              </div>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
