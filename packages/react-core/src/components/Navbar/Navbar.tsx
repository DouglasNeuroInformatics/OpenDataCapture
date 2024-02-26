import React, { useEffect, useState } from 'react';

import { BaseLanguageToggle, ThemeToggle, useMediaQuery } from '@douglasneuroinformatics/ui';
import { Bars3Icon } from '@heroicons/react/24/outline';

import { Branding } from '../Branding';
import { MobileSlider } from './MobileSlider';
import { Navigation } from './Navigation';

import type { NavI18Next, NavItem } from './types';

export type NavbarProps = {
  activeItemId?: string;
  i18n: NavI18Next;
  items?: NavItem[] | NavItem[][];
  onNavigate?: (id: string) => void;
};

export const Navbar = ({ activeItemId, i18n, items, onNavigate }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return (
    <React.Fragment>
      <div className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="h--full w-full bg-inherit">
          <div className="container flex items-center justify-between bg-inherit py-3 font-medium">
            <Branding className="[&>span]:hidden md:[&>span]:block" />
            <button
              className="md:hidden"
              type="button"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Bars3Icon height={36} width={36} />
            </button>
            <div className="hidden items-center bg-inherit md:flex">
              {items && (
                <React.Fragment>
                  <Navigation
                    activeItemId={activeItemId}
                    items={items}
                    orientation="horizontal"
                    onNavigate={onNavigate}
                  />
                  <div className="mx-5 hidden h-8 w-[1px] rounded-md bg-slate-300 md:block dark:bg-slate-600" />
                </React.Fragment>
              )}
              <div className="flex gap-3 bg-inherit">
                <ThemeToggle />
                <BaseLanguageToggle i18n={i18n} options={['en', 'fr']} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {items && (
        <MobileSlider
          activeItemId={activeItemId}
          i18n={i18n}
          isOpen={isOpen}
          items={items}
          setIsOpen={setIsOpen}
          onNavigate={(id) => {
            onNavigate?.(id);
            setIsOpen(false);
          }}
        />
      )}
    </React.Fragment>
  );
};
