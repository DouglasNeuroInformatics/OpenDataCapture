import { clsx } from 'clsx';
import { NavLink } from 'react-router-dom';

export const TabLink = ({ label, pathname }: { label: string; pathname: string }) => (
  <NavLink
    end
    className={({ isActive }) =>
      clsx(
        'flex-grow border-b px-1 py-4 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300'
      )
    }
    to={pathname}
  >
    {label}
  </NavLink>
);
