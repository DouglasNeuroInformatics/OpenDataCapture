import React from 'react';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '@/store';

export const GroupSwitcher = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const { t } = useTranslation('overview');

  // unless the user is an admin, this is set at login
  if (!currentGroup) {
    return null;
  }

  return (
    <Menu as="div" className="relative my-2 w-fit">
      <Menu.Button className="flex items-center justify-center">
        {t('currentGroup')}:&nbsp;{currentGroup.name}
        <ChevronDownIcon className="mx-1" height={16} width={16} />
      </Menu.Button>
      <Transition
        as="div"
        className="absolute bottom-0 z-10 w-full"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-2 flex w-full flex-col border border-slate-300 dark:border-slate-600">
          {currentUser?.groups.map((group) => (
            <Menu.Item key={group.name}>
              <button
                className="w-full bg-slate-50 p-2 text-left hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                style={{ minWidth: 100 }}
                onClick={() => {
                  changeGroup(group);
                }}
              >
                {group.name}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
