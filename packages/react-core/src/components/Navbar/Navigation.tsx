import type { NavItem } from './types';

export type NavigationProps = {
  items: NavItem[];
};

export const Navigation = ({ items }: NavigationProps) => {
  return (
    <nav className="flex w-full justify-end gap-3">
      {items.map(({ id, label, onClick }) => (
        <button
          className="p-2 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100"
          key={id}
          type="button"
          onClick={() => onClick(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
};
