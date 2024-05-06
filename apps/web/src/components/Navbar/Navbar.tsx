import React, { useEffect, useState } from 'react';

import { Button, LanguageToggle, Separator, Sheet, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useMediaQuery } from '@douglasneuroinformatics/libui/hooks';
import { Branding } from '@opendatacapture/react-core';
import { MenuIcon, StopCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useNavItems } from '@/hooks/useNavItems';
import { useAppStore } from '@/store';

import { NavButton } from '../NavButton';

export const Navbar = () => {
  const currentSession = useAppStore((store) => store.currentSession);
  const [isOpen, setIsOpen] = useState(false);
  const navItems = useNavItems();
  const { t } = useTranslation('layout');
  const navigate = useNavigate();

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="h-full w-full bg-inherit">
          <div className="container flex items-center justify-between bg-inherit py-2 font-medium">
            <Branding className="[&>span]:hidden" />
            <Sheet.Trigger
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
        <nav className="flex w-full flex-grow flex-col divide-y divide-slate-200 dark:divide-slate-700">
          {navItems.map((items, i) => (
            <div className="flex flex-col py-1 first:pt-0 last:pb-0" key={i}>
              {items.map(({ disabled, id, ...props }) => (
                <NavButton
                  activeClassName="bg-slate-200 text-slate-900 dark:text-slate-100 dark:bg-slate-800"
                  className="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                  disabled={disabled && location.pathname !== id}
                  id={id}
                  isActive={location.pathname === id}
                  key={id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(id);
                  }}
                  {...props}
                />
              ))}
              {i === navItems.length - 1 && (
                <NavButton
                  activeClassName="bg-slate-200 text-slate-900"
                  className="text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:dark:text-slate-100"
                  disabled={currentSession === null}
                  icon={StopCircle}
                  id="#"
                  isActive={false}
                  label={t('navLinks.endSession')}
                />
              )}
            </div>
          ))}
        </nav>
        <Sheet.Footer className="mt-auto">
          <div className="flex justify-end gap-2">
            <LanguageToggle
              options={{
                en: 'English',
                fr: 'Français'
              }}
              variant="outline"
            />
            <ThemeToggle variant="outline" />
          </div>
        </Sheet.Footer>
      </Sheet.Content>
      <Sheet.Overlay />
    </Sheet>
  );
};
