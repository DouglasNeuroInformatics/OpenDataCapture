import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { useLocation } from '@tanstack/react-router';
import { ChevronDownIcon } from 'lucide-react';

import type { NavItem } from '@/hooks/useNavItems';

import { NavButton } from '../NavButton';

type NavGroupProps = {
  activeClassName?: string;
  childClassName?: string;
  className?: string;
  icon: NavItem['icon'];
  items: NavItem[];
  label: string;
  onNavigate?: (url: string, search?: { [key: string]: string }) => void;
};

const isItemActive = (item: NavItem, pathname: string, searchParams: { [key: string]: unknown }): boolean => {
  if (item.children) {
    return item.children.some((child) => isItemActive(child, pathname, searchParams));
  }
  if (item.url !== pathname) return false;
  if (!item.search) return true;
  return Object.entries(item.search).every(([k, v]) => String(searchParams[k]) === v);
};

export const NavGroup = ({
  activeClassName,
  childClassName,
  className,
  icon: Icon,
  items,
  label,
  onNavigate
}: NavGroupProps) => {
  const location = useLocation();
  const searchParams = (location.search ?? {}) as { [key: string]: unknown };
  const containsActive = items.some((item) => isItemActive(item, location.pathname, searchParams));
  const [isOpen, setIsOpen] = React.useState(containsActive);

  React.useEffect(() => {
    if (containsActive) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname, location.search]);

  return (
    <div className="flex flex-col">
      <button
        aria-expanded={isOpen}
        className={cn(
          'flex h-9 items-center justify-start rounded-md px-3 text-sm font-medium whitespace-nowrap text-slate-200 transition-colors hover:bg-slate-800 hover:text-slate-100',
          className
        )}
        data-spotlight-type="nav-group"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Icon className="mr-2" />
        {label}
        <ChevronDownIcon className={cn('ml-auto h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="ml-4 flex flex-col border-l border-slate-500/30 pl-1">
          {items.map((item) =>
            item.children ? (
              <NavGroup
                activeClassName={activeClassName}
                childClassName={childClassName}
                className={childClassName}
                icon={item.icon}
                items={item.children}
                key={item.label}
                label={item.label}
                onNavigate={onNavigate}
              />
            ) : (
              <NavButton
                activeClassName={activeClassName}
                className={childClassName}
                disabled={item.disabled && location.pathname !== item.url}
                icon={item.icon}
                isActive={isItemActive(item, location.pathname, searchParams)}
                key={`${item.url}${item.search ? `?${new URLSearchParams(item.search).toString()}` : ''}`}
                label={item.label}
                search={item.search}
                url={item.url!}
                onClick={onNavigate}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
