import { useEffect, useState } from 'react';

import {
  Button,
  LanguageToggle,
  Select,
  Separator,
  Sheet,
  ThemeToggle
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Branding } from '@opendatacapture/react-core';
import { useNavigate } from '@tanstack/react-router';
import { MenuIcon, StopCircle } from 'lucide-react';

import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useNavItems } from '@/hooks/useNavItems';
import { useAppStore } from '@/store';

import { NavButton } from '../NavButton';
import { NavGroup } from '../NavGroup';
import { UserDropup } from '../UserDropup';

export const Navbar = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const currentUser = useAppStore((store) => store.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const navItems = useNavItems();
  const { t } = useTranslation('layout');
  const navigate = useNavigate();
  const endSession = useAppStore((store) => store.endSession);

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300"
        data-testid="navbar"
      >
        <div className="h-full w-full bg-inherit">
          <div className="container flex items-center justify-between bg-inherit py-2 font-medium">
            <Branding className="[&>span]:hidden" />
            <Sheet.Trigger
              data-testid="navbar-menu-trigger"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <MenuIcon style={{ height: 28, width: 28 }} />
            </Sheet.Trigger>
          </div>
        </div>
      </div>
      <Sheet.Trigger asChild>
        <Button variant="outline">Open</Button>
      </Sheet.Trigger>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Branding className="h-10" fontSize="md" />
        </Sheet.Header>
        <Separator />
        <nav className="flex w-full grow flex-col divide-y divide-slate-200 overflow-auto dark:divide-slate-700">
          {navItems.map((items, i) => (
            <div className="flex flex-col py-1 first:pt-0 last:pb-0" key={i}>
              {items.map(({ disabled, url, ...props }) =>
                props.children ? (
                  <NavGroup
                    activeClassName="bg-slate-200 text-slate-900 dark:text-slate-100 dark:bg-slate-800"
                    childClassName="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                    className="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                    icon={props.icon}
                    items={props.children}
                    key={props.label}
                    label={props.label}
                    onNavigate={(to) => {
                      setIsOpen(false);
                      void navigate({ to });
                    }}
                  />
                ) : (
                  <NavButton
                    activeClassName="bg-slate-200 text-slate-900 dark:text-slate-100 dark:bg-slate-800"
                    className="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                    disabled={disabled && location.pathname !== url}
                    isActive={location.pathname === url}
                    key={url}
                    url={url!}
                    onClick={() => {
                      setIsOpen(false);
                      void navigate({ to: url! });
                    }}
                    {...props}
                  />
                )
              )}
              {i === navItems.length - 1 && (
                <NavButton
                  activeClassName="bg-slate-200 text-slate-900"
                  className="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                  disabled={currentSession === null}
                  icon={StopCircle}
                  isActive={false}
                  label={t('navLinks.endSession')}
                  url="#"
                  onClick={() => {
                    endSession();
                    void navigate({ to: '/session/start-session' });
                  }}
                />
              )}
            </div>
          ))}
        </nav>
        {/* Colors mirror the desktop sidebar's group switcher so the control reads the same on both layouts. */}
        {currentGroup && currentUser && currentUser.groups.length > 0 && (
          <div className="my-4 px-3">
            {currentUser.groups.length === 1 ? (
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-sky-700 text-sm font-semibold text-slate-100">
                {currentGroup.name}
              </div>
            ) : (
              <Select
                value={currentGroup.id}
                onValueChange={(id) => changeGroup(currentUser.groups.find((g) => g.id === id)!)}
              >
                <Select.Trigger className="w-full border-transparent bg-sky-700 font-semibold text-slate-100 hover:bg-sky-600 focus:ring-sky-600 [&>svg]:text-slate-300 [&>svg]:opacity-100">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {currentUser.groups.map((group) => (
                      <Select.Item key={group.id} value={group.id}>
                        {group.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            )}
          </div>
        )}
        <Sheet.Footer className="mt-auto">
          <div className="flex w-full justify-between gap-2 md:justify-end">
            <UserDropup />
            <div className="flex gap-2">
              <LanguageToggle
                options={{
                  en: 'English',
                  fr: 'Français'
                }}
                variant="outline"
              />
              <ThemeToggle variant="outline" />
            </div>
          </div>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
};
