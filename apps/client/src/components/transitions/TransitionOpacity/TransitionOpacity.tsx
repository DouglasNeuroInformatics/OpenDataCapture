import React from 'react';

import { Transition } from '@headlessui/react';

export interface TransitionOpacityProps {
  children: React.ReactNode;
  show?: boolean;
}

export const TransitionOpacity = ({ children, show }: TransitionOpacityProps) => {
  return (
    <Transition
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={show}
    >
      {children}
    </Transition>
  );
};
