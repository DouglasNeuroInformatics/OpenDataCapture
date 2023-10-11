import React, { useMemo } from 'react';

import type { AppAction, AppSubject } from '@open-data-capture/types';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

type LinkAccess = {
  action: AppAction;
  subject: AppSubject;
};

export type NavigationLinkProps = {
  access: LinkAccess | LinkAccess[] | null;
  cyTestId?: string;
  href: string;
  icon: React.ReactElement;
  label: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const NavigationLink = ({ access, cyTestId, href, icon, label, onClick }: NavigationLinkProps) => {
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
    <NavLink
      className={({ isActive }) =>
        clsx(
          'flex items-center p-2 hover:bg-slate-200 dark:hover:bg-slate-700 md:text-base md:hover:bg-slate-800',
          isActive
            ? 'bg-slate-200 dark:bg-slate-700 md:bg-slate-800 md:text-slate-200'
            : 'md:bg-slate-900 md:text-slate-300'
        )
      }
      to={href}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2" data-cy={cyTestId}>
        {label}
      </span>
    </NavLink>
  ) : null;
};
