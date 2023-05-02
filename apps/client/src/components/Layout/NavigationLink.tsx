import React, { useMemo } from 'react';

import { AppAction, AppSubject } from '@douglasneuroinformatics/common';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

type LinkAccess = {
  action: AppAction;
  subject: AppSubject;
};

export interface NavigationLinkProps {
  access: LinkAccess | LinkAccess[] | null;
  href: string;
  label: string;
  icon: React.ReactElement;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const NavigationLink = ({ href, label, icon, access, onClick }: NavigationLinkProps) => {
  const { currentUser } = useAuthStore();

  // Whether the user has all permissions or access is undefined
  const isAuthorized = useMemo(() => {
    if (!currentUser?.ability) {
      return false;
    }
    if (!access) {
      return true;
    }
    if (Array.isArray(access)) {
      for (const { action, subject } of access) {
        if (!currentUser.ability.can(action, subject)) {
          return false;
        }
      }
      return true;
    }
    return currentUser.ability.can(access.action, access.subject);
  }, [currentUser]);

  return isAuthorized ? (
    <NavLink className="flex items-center p-2 text-sm hover:bg-slate-800 md:text-base" to={href} onClick={onClick}>
      {icon}
      <span className="ml-2">{label}</span>
    </NavLink>
  ) : null;
};
