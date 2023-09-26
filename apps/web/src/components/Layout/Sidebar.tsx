import { ThemeToggle } from '@douglasneuroinformatics/ui';

import { Branding } from './Branding';
import { Navigation } from './Navigation';
import { UserDropup } from './UserDropup';

export const Sidebar = () => {
  return (
    <div className="flex h-screen w-80 flex-col bg-slate-900 p-3 text-slate-300 shadow-lg dark:border-r dark:border-slate-700">
      <Branding />
      <hr className="my-1" />
      <Navigation />
      <hr className="my-1 mt-auto" />
      <div className="flex items-center">
        <UserDropup />
        <ThemeToggle className="hover:backdrop-brightness-150" />
      </div>
    </div>
  );
};
