import { cn } from '@douglasneuroinformatics/ui';

import type { NavItem } from './types';

export type NavigationProps = {
  items: NavItem[];
  onNavigate?: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
};

export const Navigation = ({ items, onNavigate, orientation }: NavigationProps) => {
  return (
    <nav
      className={cn('flex w-full gap-3', {
        'flex-col': orientation === 'vertical',
        'justify-end': orientation === 'horizontal'
      })}
    >
      {items.map(({ icon: Icon, id, label, ...props }) => (
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
