import React from 'react';

import { Popover, Transition } from '@headlessui/react';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

interface FormFieldDescriptionProps {
  description?: string;
}

export const FormFieldDescription = ({ description }: FormFieldDescriptionProps) => {
  return description ? (
    <div className="flex items-center justify-center">
      <Popover>
        <Popover.Button tabIndex={-1}>
          <HiOutlineQuestionMarkCircle />
        </Popover.Button>
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute right-0 z-10 mt-3 max-w-xs rounded-lg bg-slate-50 p-2 text-sm text-gray-500 shadow-xl">
            {description}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  ) : null;
};
