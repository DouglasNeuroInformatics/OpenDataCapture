import React from 'react';

import { Transition } from '@headlessui/react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX, HiXCircle } from 'react-icons/hi';

import { type Notification as NotificationInterface } from '@/stores/notifications-store';

const icons: { [key in NotificationInterface['type']]: JSX.Element } = {
  info: <HiInformationCircle aria-hidden="true" className="h-6 w-6 text-blue-500" />,
  success: <HiCheckCircle aria-hidden="true" className="h-6 w-6 text-green-500" />,
  warning: <HiExclamationCircle aria-hidden="true" className="h-6 w-6 text-yellow-500" />,
  error: <HiXCircle aria-hidden="true" className="h-6 w-6 text-red-500" />
};

export type NotificationProps = {
  notification: NotificationInterface;
  onDismiss: (id: string) => void;
};

export const Notification = ({ notification: { id, type, title, message }, onDismiss }: NotificationProps) => {
  title = title ?? type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <Transition
        as={React.Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={true}
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div aria-label={title} className="p-4" role="alert">
            <div className="flex items-start">
              <div className="flex-shrink-0">{icons[type]}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => {
                    onDismiss(id);
                  }}
                >
                  <span className="sr-only">Close</span>
                  <HiX aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};
