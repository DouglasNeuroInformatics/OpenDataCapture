import { BaseLanguageToggle, ThemeToggle } from '@douglasneuroinformatics/ui';
import type { Promisable } from 'type-fest';

import { Logo } from '../Logo';

export type NavbarProps = {
  i18n: {
    changeLanguage: (lang: string) => Promisable<unknown>;
    resolvedLanguage?: string;
  };
  items?: {
    label: string;
  }[];
};

export const Navbar = ({ i18n, items }: NavbarProps) => {
  return (
    <div className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
      <div className="container flex items-center bg-inherit py-3 font-medium">
        <div className="flex h-10 items-center [&>svg]:h-full [&>svg]:w-auto">
          <Logo className="h-full w-auto" />
          <span className="font-lg ml-3 hidden whitespace-nowrap font-semibold md:block">Open Data Capture</span>
        </div>
        <nav className="flex w-full justify-end gap-3">
          {/* <a className="p-2 dark:text-slate-300 dark:hover:text-slate-100" href={translatePath('/')}>
            {t('landing.title')}
          </a>
          <a className="p-2 dark:text-slate-300 dark:hover:text-slate-100" href={translatePath('/docs')}>
            {t('docs.title')}
          </a>
          <a className="p-2 dark:text-slate-300 dark:hover:text-slate-100" href={translatePath('/team')}>
            {t('team.title')}
          </a>
          <a className="p-2 dark:text-slate-300 dark:hover:text-slate-100" href={translatePath('/blog')}>
            {t('blog.title')}
          </a> */}
        </nav>
        {items && <div className="mx-5 hidden h-8 w-[1px] rounded-md bg-slate-300 dark:bg-slate-700 md:block" />}
        <div className="flex flex-grow justify-end gap-3 bg-inherit">
          <ThemeToggle />
          <BaseLanguageToggle i18n={i18n} options={['en', 'fr']} />
        </div>
      </div>
    </div>
  );
};
