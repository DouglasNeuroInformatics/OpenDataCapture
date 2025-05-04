import { clsx } from 'clsx';
import { NavLink } from 'react-router-dom';

export const TabLink = ({ dataCy, label, pathname }: { dataCy?: string; label: string; pathname: string }) => (
  <NavLink
    end
    className={({ isActive }) =>
      clsx(
        'grow border-b px-1 py-3 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300 dark:border-slate-700'
      )
    }
    data-cy={dataCy}
    data-nav-url={pathname}
    data-spotlight-type="tab-link"
    to={pathname}
  >
    {label}
  </NavLink>
);
