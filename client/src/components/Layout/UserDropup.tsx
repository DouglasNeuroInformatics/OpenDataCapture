import React, { useRef, useState } from 'react';

import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { HiUserCircle } from 'react-icons/hi2';
import { IoIosArrowUp } from 'react-icons/io';

import LanguageToggle from '../LanguageToggle';

import useAuth from '@/hooks/useAuth';
import useOnClickOutside from '@/hooks/useOnClickOutside';

const UserDropup = ({ username }: { username?: string }) => {
  const auth = useAuth();
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
          </div>
        </Transition>
      </div>
      <button className="flex w-full items-center p-2" onClick={() => setIsOpen(!isOpen)}>
        <HiUserCircle className="mr-2 h-8 w-8" />
        <span>{username}</span>
        <IoIosArrowUp
          className={classNames('mx-1', {
            'rotate-90': !isOpen
          })}
        />
      </button>
    </div>
  );
};

export default UserDropup;
