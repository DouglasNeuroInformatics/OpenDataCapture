import React from 'react';

import { HiBars3 } from 'react-icons/hi2';

interface NavbarProps {
  onToggleClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Navbar = ({ onToggleClick }: NavbarProps) => {
  return (
    <div className="flex w-full bg-slate-900 p-2 text-slate-300">
      <button onClick={onToggleClick}>
        <HiBars3 className="h-7 w-7" />
      </button>
    </div>
  );
};

export { Navbar as default, type NavbarProps };
