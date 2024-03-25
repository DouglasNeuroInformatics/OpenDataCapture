import React, { useState } from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { EditorHelpModal } from './EditorHelpModal';

export type EditorMenuProps = {
  onInitSave?: () => void;
};

export const EditorMenu = ({ onInitSave }: EditorMenuProps) => {
  const { t } = useTranslation('core');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [theme, updateTheme] = useTheme();

  return (
    <React.Fragment>
      <Menu as="div" className="relative">
        <Menu.Button
          className="flex w-full items-center justify-center p-2 hover:backdrop-brightness-95 dark:hover:backdrop-brightness-150"
          type="button"
        >
          <EllipsisVerticalIcon height={20} width={20} />
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
          <Menu.Items
            as={Card}
            className="absolute right-2 z-10 mt-2 flex w-fit min-w-full flex-col overflow-hidden whitespace-nowrap text-sm"
          >
            <Menu.Item
              as="button"
              className="p-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700"
              type="button"
              onClick={onInitSave}
            >
              {t('save')}
            </Menu.Item>
            <Menu.Item
              as="button"
              className="p-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700"
              type="button"
              onClick={() => {
                updateTheme(theme === 'dark' ? 'light' : 'dark');
              }}
            >
              {t('changeTheme')}
            </Menu.Item>
            <Menu.Item
              as="button"
              className="p-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700"
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
            >
              {t('help')}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
      <EditorHelpModal isOpen={isHelpModalOpen} setIsOpen={setIsHelpModalOpen} />
    </React.Fragment>
  );
};
