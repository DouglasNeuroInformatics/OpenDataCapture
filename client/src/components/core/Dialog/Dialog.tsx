import React from 'react';

import { Transition, Dialog as UIDialog } from '@headlessui/react';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialFocus?: React.MutableRefObject<null>;
};

export const DialogTitle = UIDialog.Title;

export const DialogDescription = UIDialog.Description;

export const Dialog = ({ isOpen, onClose, children, initialFocus }: DialogProps) => {
  return (
    <>
      <Transition.Root as={React.Fragment} show={isOpen}>
        <UIDialog
          static
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          initialFocus={initialFocus}
          open={isOpen}
          onClose={onClose}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <UIDialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span aria-hidden="true" className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {children}
            </Transition.Child>
          </div>
        </UIDialog>
      </Transition.Root>
    </>
  );
};
