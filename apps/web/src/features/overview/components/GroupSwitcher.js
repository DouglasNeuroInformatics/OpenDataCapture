import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { HiChevronDown } from 'react-icons/hi';
import { useAuthStore } from '@/stores/auth-store';
export var GroupSwitcher = function () {
  var _a = useAuthStore(),
    currentUser = _a.currentUser,
    currentGroup = _a.currentGroup,
    setCurrentGroup = _a.setCurrentGroup;
  var t = useTranslation().t;
  // unless the user is an admin, this is set at login
  if (!currentGroup) {
    return null;
  }
  return React.createElement(
    Menu,
    { as: 'div', className: 'relative my-2 w-fit' },
    React.createElement(
      Menu.Button,
      { className: 'flex items-center justify-center' },
      t('currentGroup'),
      ':\u00A0',
      currentGroup.name,
      React.createElement(HiChevronDown, { className: 'mx-1' })
    ),
    React.createElement(
      Transition,
      {
        as: 'div',
        className: 'absolute bottom-0 z-10 w-full',
        enter: 'transition ease-out duration-100',
        enterFrom: 'transform opacity-0 scale-95',
        enterTo: 'transform opacity-100 scale-100',
        leave: 'transition ease-in duration-75',
        leaveFrom: 'transform opacity-100 scale-100',
        leaveTo: 'transform opacity-0 scale-95'
      },
      React.createElement(
        Menu.Items,
        { className: 'absolute z-10 mt-2 flex w-full flex-col border border-slate-300 dark:border-slate-600' },
        currentUser === null || currentUser === void 0
          ? void 0
          : currentUser.groups.map(function (group) {
              return React.createElement(
                Menu.Item,
                { key: group.name },
                React.createElement(
                  'button',
                  {
                    className:
                      'w-full bg-slate-50 p-2 text-left hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
                    style: { minWidth: 100 },
                    onClick: function () {
                      setCurrentGroup(group);
                    }
                  },
                  group.name
                )
              );
            })
      )
    )
  );
};
