import React, { useRef, useState } from 'react';

import { ArrowToggle } from '@douglasneuroinformatics/libui/components';
import { useOnClickOutside } from '@douglasneuroinformatics/libui/hooks';
import { Transition } from '@headlessui/react';
import { AdjustmentsVerticalIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/store';

import { LanguageToggle } from './LanguageToggle';

export const UserDropup = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const logout = useAppStore((store) => store.logout);

  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('layout');

  const closeDropup = () => {
    setIsOpen(false);
  };

  useOnClickOutside(ref, () => {
    if (isOpen) {
      closeDropup();
    }
  });

  return (
    <div className="relative w-full" ref={ref}>
      <div className="absolute top-0 w-full">
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          show={isOpen}
        >
          <div className="absolute bottom-3 w-44 overflow-hidden rounded-md border border-slate-700 bg-slate-800 tracking-tight shadow-lg">
            <button
              className="flex w-full items-center px-3 py-2  hover:bg-slate-700"
              onClick={() => {
                logout();
              }}
            >
              <LockClosedIcon className="mr-2" height={16} width={16} />
              {t('userDropup.logout')}
            </button>
            <LanguageToggle className="w-full px-3 py-2 text-left hover:bg-slate-700" onClick={closeDropup} />
            <Link
              className="flex w-full items-center px-3 py-2 text-left hover:bg-slate-700"
              to="/user"
              onClick={closeDropup}
            >
              <AdjustmentsVerticalIcon className="mr-2" height={16} width={16} />
              {t('userDropup.preferences')}
            </Link>
          </div>
        </Transition>
      </div>
      <ArrowToggle
        className="p-2"
        position="right"
        rotation={-90}
        size="md"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex flex-row-reverse items-center">
          <UserCircleIcon className="mr-2 h-8 w-8" />
          <span>{currentUser?.username}</span>
        </div>
      </ArrowToggle>
    </div>
  );
};
