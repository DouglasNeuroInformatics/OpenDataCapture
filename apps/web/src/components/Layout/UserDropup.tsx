import React, { useRef, useState } from 'react';

import { useOnClickOutside } from '@douglasneuroinformatics/ui/hooks';
import { ArrowToggle } from '@douglasneuroinformatics/ui/legacy';
import { Transition } from '@headlessui/react';
import { AdjustmentsVerticalIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { LanguageToggle } from './LanguageToggle';

export const UserDropup = () => {
  const auth = useAuthStore();
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
                auth.logout();
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
        content={
          <div className="flex items-center">
            <UserCircleIcon className="mr-2 h-8 w-8" />
            <span>{auth.currentUser?.username}</span>
          </div>
        }
        contentPosition="left"
        position="right"
        rotation={-90}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      />
    </div>
  );
};
