import React from 'react';
import { Transition } from '@headlessui/react';
export var TransitionOpacity = function (_a) {
  var children = _a.children,
    show = _a.show;
  return React.createElement(
    Transition,
    {
      enter: 'transition-opacity duration-100',
      enterFrom: 'opacity-0',
      enterTo: 'opacity-100',
      leave: 'transition-opacity duration-150',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0',
      show: show
    },
    children
  );
};
