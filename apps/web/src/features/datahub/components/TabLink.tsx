import React from 'react';

import { clsx } from 'clsx';
import { NavLink } from 'react-router-dom';

export const TabLink = ({ dataCy, label, pathname }: { dataCy?: string; label: string; pathname: string }) => (
  <NavLink
    end
    className={({ isActive }) =>
      clsx(
        'flex-grow border-b px-1 py-3 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300 dark:border-slate-700'
      )
    }
    data-cy={dataCy}
    to={pathname}
  >
    {label}
  </NavLink>
);
