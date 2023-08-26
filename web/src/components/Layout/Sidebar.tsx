import React from 'react';

import { ThemeToggle } from '@douglasneuroinformatics/ui';

import { Branding } from './Branding';
import { Navigation } from './Navigation';
import { UserDropup } from './UserDropup';

export const Sidebar = () => {
  return (
    <div className="flex h-screen w-80 flex-col bg-slate-900 p-3 text-slate-300 shadow-lg ring-1 ring-black">
      <Branding />
      <hr className="my-1" />
      <Navigation />
      <hr className="my-1 mt-auto" />
      <div className="flex items-center">
        <UserDropup />
        <ThemeToggle />
      </div>
    </div>
  );
};
