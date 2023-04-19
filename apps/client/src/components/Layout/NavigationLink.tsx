import React from 'react';

import { AppAction, AppSubject } from '@douglasneuroinformatics/common';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

export interface NavigationLinkProps {
  access: [AppAction, AppSubject] | null;
  href: string;
  label: string;
  icon: React.ReactElement;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const NavigationLink = ({ href, label, icon, access, onClick }: NavigationLinkProps) => {
  const { currentUser } = useAuthStore();

  const isAuthorized = currentUser?.ability && (access === null || currentUser.ability.can(access[0], access[1]));

  return isAuthorized ? (
    <NavLink className="flex items-center p-2 text-sm hover:bg-slate-800 md:text-base" to={href} onClick={onClick}>
      {icon}
      <span className="ml-2">{label}</span>
    </NavLink>
  ) : null;
};
