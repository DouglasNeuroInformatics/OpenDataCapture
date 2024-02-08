import { cn } from '@douglasneuroinformatics/ui';

import type { NavItem } from './types';

export type NavigationProps = {
  activeItemId?: string;
  btn?: {
    activeClassName: string;
    className: string;
  };
  items: NavItem[];
  onNavigate?: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
};

export const Navigation = ({ activeItemId, btn, items, onNavigate, orientation }: NavigationProps) => {
  return (
    <nav
      className={cn('flex w-full', {
        'flex-col': orientation === 'vertical',
        'justify-end': orientation === 'horizontal'
      })}
    >
      {items.map(({ icon: Icon, id, label, ...props }) => (
        <button
          className={cn(
            'flex items-center p-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100',
            {
              'justify-start': orientation === 'vertical',
              'mx-1 justify-center': orientation === 'horizontal'
            },
            btn?.className,
            activeItemId === id && (btn?.activeClassName ?? 'text-slate-900 dark:text-slate-100')
          )}
          key={id}
          type="button"
          onClick={() => onNavigate?.(id)}
          {...props}
        >
          {Icon && (
            <Icon
              className={cn('mr-2', {
                hidden: orientation === 'horizontal'
              })}
              height={16}
              width={16}
            />
          )}
          {label}
        </button>
      ))}
    </nav>
  );
};
