import { cn } from '@douglasneuroinformatics/ui';

import { NavButton } from './NavButton';

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
    </nav>
  );
};
