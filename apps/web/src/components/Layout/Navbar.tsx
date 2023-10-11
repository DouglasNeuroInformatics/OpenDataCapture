import { useEffect, useState } from 'react';

import { Slider, ThemeToggle, useMediaQuery } from '@douglasneuroinformatics/ui';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Branding } from './Branding';
import { Navigation } from './Navigation';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return (
    <>
      <div className="flex w-full items-center justify-between bg-slate-900 p-2 dark:bg-slate-800">
        <Branding showText={false} />
        <button
          className="text-slate-300 hover:text-slate-200"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Bars3Icon height={36} width={36} />
        </button>
      </div>
      {!isDesktop && (
        <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={<Branding />}>
          <div className="flex h-full flex-col">
            <Navigation
              onClick={() => {
                setIsOpen(false);
              }}
            />
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <button
                className="rounded-md p-2 font-medium hover:backdrop-brightness-95 dark:hover:backdrop-brightness-150"
                type="button"
                onClick={() => {
                  void i18n.changeLanguage(i18n.resolvedLanguage === 'en' ? 'fr' : 'en');
                }}
              >
                {i18n.resolvedLanguage === 'en' ? 'Français' : 'English'}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </Slider>
      )}
    </>
  );
};
