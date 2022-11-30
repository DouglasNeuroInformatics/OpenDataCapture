import React from 'react';

import { Bars3Icon } from '@heroicons/react/24/solid';

interface NavbarProps {
  onToggleClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Navbar = ({ onToggleClick }: NavbarProps) => {
  return (
    <div className="d-block d-md-none bg-dark p-2">
      <button className="btn btn-link text-light" type="button" onClick={onToggleClick}>
        <Bars3Icon height="24" width="24" />
      </button>
    </div>
  );
};

export default Navbar;
