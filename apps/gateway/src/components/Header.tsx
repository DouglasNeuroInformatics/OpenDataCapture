import { LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/ui';

import { Branding } from './Branding';

export const Header = () => {
  return (
    <header className="bg-white text-slate-700 shadow dark:bg-slate-800 dark:text-slate-300">
      <div className="container flex items-center justify-between bg-inherit py-2">
        <Branding />
        <div className="flex gap-3 bg-inherit">
          <ThemeToggle />
          <LanguageToggle options={['en', 'fr']} />
        </div>
      </div>
    </header>
  );
};
