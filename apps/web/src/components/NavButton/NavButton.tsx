import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { useNavigate } from '@tanstack/react-router';

import type { NavItem } from '@/hooks/useNavItems';

type NavButtonProps = Omit<NavItem, 'children' | 'search' | 'url'> & {
  activeClassName?: string;
  className?: string;
  isActive: boolean;
  onClick?: (path: string, search?: { [key: string]: string }) => void;
  search?: { [key: string]: string };
  url: string;
};

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(function NavButton(
  { activeClassName, className, disabled, icon: Icon, isActive, label, onClick, search, url, ...props },
  ref
) {
  const navigate = useNavigate();
  return (
    <button
      className={cn(
        'flex h-9 items-center justify-start rounded-md px-3 text-sm font-medium whitespace-nowrap text-slate-200 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50',
        isActive && 'bg-slate-800 text-slate-100',
        isActive && activeClassName,
        className
      )}
      data-nav-url={url}
      data-spotlight-type="nav-button"
      data-testid={`nav-button-${url}`}
      disabled={disabled}
      ref={ref}
      type="button"
      onClick={() => {
        if (onClick) {
          onClick(url, search);
        } else {
          void navigate({ search: search, to: url });
        }
      }}
      {...props}
    >
      <Icon className="mr-2" />
      {label}
    </button>
  );
});
