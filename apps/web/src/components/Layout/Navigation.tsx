import { cn } from '@douglasneuroinformatics/ui';

import { NavButton } from './NavButton';

import type { NavItem } from './types';

export type NavigationProps = {
  activeItemId?: string;
  btn?: {
    activeClassName: string;
    className: string;
  };
  isAlwaysDark: boolean;
  items: NavItem[] | NavItem[][];
  onNavigate?: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
};

export const Navigation = ({ activeItemId, btn, isAlwaysDark, items, onNavigate, orientation }: NavigationProps) => {
  const groups = (Array.isArray(items[0]) ? items : [items]) as NavItem[][];
  return (
    <nav
      className={cn('flex w-full divide-y divide-slate-300 dark:divide-slate-700', {
        'divide-slate-700': isAlwaysDark,
        'flex-col': orientation === 'vertical',
        'justify-end': orientation === 'horizontal'
      })}
    >
      {groups.map((items, i) => (
        <div className="w-full py-2 first:pt-0 last:pb-0" key={i}>
          {items.map(({ id, ...props }) => (
            <NavButton
              activeClassName={btn?.activeClassName}
              className={btn?.className}
              isActive={activeItemId === id}
              key={id}
              variant={orientation}
              onClick={() => onNavigate?.(id)}
              {...props}
            />
          ))}
        </div>
      ))}
    </nav>
  );
};
