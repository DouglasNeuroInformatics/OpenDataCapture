import { useState } from 'react';

import { BaseLanguageToggle, Slider, ThemeToggle, useMediaQuery } from '@douglasneuroinformatics/ui';
import type { Promisable } from 'type-fest';

import { Branding } from '../Branding';

export type NavbarProps = {
  i18n: {
    changeLanguage: (lang: string) => Promisable<unknown>;
    resolvedLanguage?: string;
  };
  items?: {
    id: number | string;
    label: string;
    onClick: (id: number | string) => void;
  }[];
};

export const Navbar = ({ i18n, items }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <>
      <div className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="container flex items-center bg-inherit py-3 font-medium">
          <Branding showText={isDesktop} />
          <nav className="flex w-full justify-end gap-3">
            {items?.map(({ id, label, onClick }) => (
              <button
                className="p-2 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100"
                key={id}
                type="button"
                onClick={() => onClick(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          {items && <div className="mx-5 hidden h-8 w-[1px] rounded-md bg-slate-300 dark:bg-slate-700 md:block" />}
          <div className="flex flex-grow justify-end gap-3 bg-inherit">
            <ThemeToggle />
            <BaseLanguageToggle i18n={i18n} options={['en', 'fr']} />
          </div>
        </div>
      </div>
      {isDesktop && (
        <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={<Branding />}>
          Foo
        </Slider>
      )}
    </>
  );
};
