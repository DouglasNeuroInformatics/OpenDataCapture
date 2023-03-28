import React from 'react';

import { NavLink } from 'react-router-dom';

export interface NavigationLinkProps {
  href: string;
  label: string;
  icon: React.ReactElement;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const NavigationLink = ({ href, label, icon, onClick }: NavigationLinkProps) => {
  return (
    <NavLink className="flex items-center p-2 text-sm hover:bg-slate-800 md:text-base" to={href} onClick={onClick}>
      {icon}
      <span className="ml-2">{label}</span>
    </NavLink>
  );
};
