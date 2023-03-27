import React from 'react';

import { HiBars3 } from 'react-icons/hi2';

import { Branding } from './Branding';

export const Navbar = () => {
  return (
    <div className="flex w-full justify-between bg-slate-900 p-2 text-slate-300">
      <Branding />
      <button>
        <HiBars3 className="h-9 w-9" />
      </button>
    </div>
  );
};
