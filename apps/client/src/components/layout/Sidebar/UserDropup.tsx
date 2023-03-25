import React, { useRef, useState } from 'react';

import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { HiUserCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

import { ArrowToggle, LanguageToggle } from '@/components/core';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useAuthStore } from '@/stores/auth-store';

export const UserDropup = () => {
  const auth = useAuthStore();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const closeDropup = () => setIsOpen(false);

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
          <div className="absolute bottom-3 w-40 bg-slate-800 shadow-lg">
            <button className="w-full p-2 hover:bg-slate-700" onClick={() => auth.logout()}>
              {t('userDropup.logout')}
            </button>
            <LanguageToggle className="w-full p-2 hover:bg-slate-700" onClick={closeDropup} />
            <Link className="block w-full p-2 text-center hover:bg-slate-700" to="/user" onClick={closeDropup}>
              {t('userDropup.preferences')}
            </Link>
          </div>
        </Transition>
      </div>
      <button className="flex w-full items-center p-2" onClick={() => setIsOpen(!isOpen)}>
        <HiUserCircle className="mr-2 h-8 w-8" />
        <ArrowToggle content={auth.currentUser?.username} contentPosition="left" position="right" rotation={-90} />
      </button>
    </div>
  );
};
