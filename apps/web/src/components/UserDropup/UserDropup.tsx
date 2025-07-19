import { useState } from 'react';

import { ArrowToggle, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Info, LogOutIcon, SchoolIcon, SettingsIcon } from 'lucide-react';

import { useAppStore } from '@/store';

import { UserIcon } from '../UserIcon';

export const UserDropup = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const currentSession = useAppStore((store) => store.currentSession);
  const logout = useAppStore((store) => store.logout);
  const setIsWalkthroughOpen = useAppStore((store) => store.setIsWalkthroughOpen);
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
        className="w-56 border-slate-700 bg-slate-800 text-slate-300 shadow-md"
        side="top"
      >
        <DropdownMenu.Label className="text-slate-300">{currentUser?.username}</DropdownMenu.Label>
        <DropdownMenu.Separator className="bg-slate-700" />
        <DropdownMenu.Group>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100 focus:ring-0"
            onClick={() => {
              void navigate({ to: '/about' });
            }}
          >
            <Info />
            {t({
              en: 'About',
              fr: 'Information'
            })}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100"
            onClick={() => {
              void navigate({ to: '/user' });
            }}
          >
            <SettingsIcon />
            {t({
              en: 'Preferences',
              fr: 'Préférences'
            })}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100"
            disabled={currentSession !== null}
            onClick={() => {
              setIsWalkthroughOpen(true);
            }}
          >
            <SchoolIcon />
            {t({
              en: 'Tutorial',
              fr: 'Tutoriel'
            })}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-2 hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100 focus:ring-0"
            onClick={() => {
              logout();
              void navigate({ reloadDocument: true, to: '/auth/login' });
            }}
          >
            <LogOutIcon />
            {t({
              en: 'Logout',
              fr: 'Se déconnecter'
            })}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
