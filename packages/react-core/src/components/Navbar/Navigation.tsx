import { cn } from '@douglasneuroinformatics/ui';

import type { NavItem } from './types';

export type NavigationProps = {
  items: NavItem[];
  orientation: 'horizontal' | 'vertical';
};

export const Navigation = ({ items, orientation }: NavigationProps) => {
  return (
    <nav
      className={cn('flex w-full gap-3', {
        'flex-col': orientation === 'vertical',
        'justify-end': orientation === 'horizontal'
      })}
    >
      {items.map(({ id, label, onClick }) => (
        <button
          className={cn(
            'flex items-center p-2 text-slate-900 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100',
            {
              'justify-center': orientation === 'horizontal',
              'justify-start': orientation === 'vertical'
            }
          )}
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
