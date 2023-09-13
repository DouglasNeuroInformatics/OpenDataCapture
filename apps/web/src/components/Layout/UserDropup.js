import React, { useRef, useState } from 'react';
import { ArrowToggle, useOnClickOutside } from '@douglasneuroinformatics/ui';
import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { HiUserCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { LanguageToggle } from '@/components';
import { useAuthStore } from '@/stores/auth-store';
export var UserDropup = function () {
  var _a;
  var auth = useAuthStore();
  var ref = useRef(null);
  var _b = useState(false),
    isOpen = _b[0],
    setIsOpen = _b[1];
  var t = useTranslation().t;
  var closeDropup = function () {
    setIsOpen(false);
  };
  useOnClickOutside(ref, function () {
    if (isOpen) {
      closeDropup();
    }
  });
  return React.createElement(
    'div',
    { className: 'relative w-full', ref: ref },
    React.createElement(
      'div',
      { className: 'absolute top-0 w-full' },
      React.createElement(
        Transition,
        {
          as: React.Fragment,
          enter: 'transition ease-out duration-100',
          enterFrom: 'transform opacity-0 scale-95',
          enterTo: 'transform opacity-100 scale-100',
          leave: 'transition ease-in duration-75',
          leaveFrom: 'transform opacity-100 scale-100',
          leaveTo: 'transform opacity-0 scale-95',
          show: isOpen
        },
        React.createElement(
          'div',
          { className: 'absolute bottom-3 w-40 bg-slate-800 shadow-lg' },
          React.createElement(
            'button',
            {
              className: 'w-full p-2 hover:bg-slate-700',
              onClick: function () {
                auth.logout();
              }
            },
            t('userDropup.logout')
          ),
          React.createElement(LanguageToggle, { className: 'w-full p-2 hover:bg-slate-700', onClick: closeDropup }),
          React.createElement(
            Link,
            { className: 'block w-full p-2 text-center hover:bg-slate-700', to: '/user', onClick: closeDropup },
            t('userDropup.preferences')
          )
        )
      )
    ),
    React.createElement(ArrowToggle, {
      className: 'p-2',
      content: React.createElement(
        'div',
        { className: 'flex items-center' },
        React.createElement(HiUserCircle, { className: 'mr-2 h-8 w-8' }),
        React.createElement('span', null, (_a = auth.currentUser) === null || _a === void 0 ? void 0 : _a.username)
      ),
      contentPosition: 'left',
      position: 'right',
      rotation: -90,
      onClick: function () {
        setIsOpen(!isOpen);
      }
    })
  );
};
