import React, { useState } from 'react';

import { ArrowToggle, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { LogOutIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/store';

import { UserIcon } from '../UserIcon';

export const UserDropup = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const logout = useAppStore((store) => store.logout);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation('layout');

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild className="flex items-center gap-1.5 focus-visible:ring-0">
        <ArrowToggle
          className="flex flex-row-reverse items-center p-2 hover:bg-slate-700 hover:text-slate-100"
          isToggled={isOpen}
          position="right"
          rotation={-90}
          size="md"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <p className="ml-0.5">{currentUser?.username}</p>
          <UserIcon />
        </ArrowToggle>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        className="w-56 border-slate-700 bg-slate-800 text-slate-300 shadow-md "
        side="top"
      >
        <DropdownMenu.Label className="text-slate-300">{currentUser?.username}</DropdownMenu.Label>
        <DropdownMenu.Separator className="bg-slate-700" />
        <DropdownMenu.Group>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100 focus:ring-0"
            onClick={logout}
          >
            <LogOutIcon />
            {t('userDropup.logout')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100"
            onClick={() => {
              navigate('/user');
            }}
          >
            <SettingsIcon />
            {t('userDropup.preferences')}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
