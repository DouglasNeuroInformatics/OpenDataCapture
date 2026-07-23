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
  onNavigate?: (url: string) => void;
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
  const containsActive = items.some((item) => item.url === location.pathname);
  const [isOpen, setIsOpen] = React.useState(containsActive);

  React.useEffect(() => {
    if (containsActive) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col">
      <button
        aria-expanded={isOpen}
        className={cn(
          'flex h-9 items-center justify-start whitespace-nowrap rounded-md px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-slate-100',
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
          {/* `children` is destructured out rather than spread: NavButton renders a <button>, and a
              nested group's items would otherwise land in it as React children. */}
          {items.map(({ children: _, disabled, url, ...props }) => (
            <NavButton
              activeClassName={activeClassName}
              className={childClassName}
              // Matches the flat items in Sidebar/Navbar: a disabled item stays reachable while it is
              // the current route, so the user is never stranded on a page they cannot navigate from.
              disabled={disabled && location.pathname !== url}
              isActive={location.pathname === url}
              key={url}
              url={url!}
              onClick={onNavigate}
              {...props}
            />
          ))}
        </div>
      )}
    </div>
  );
};
