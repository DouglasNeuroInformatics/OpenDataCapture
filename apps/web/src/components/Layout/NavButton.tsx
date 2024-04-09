import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

export type NavButtonProps = {
  [key: `data-${string}`]: unknown;
  activeClassName?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  isActive: boolean;
  label: string;
  onClick?: () => void;
};

export const NavButton = ({ activeClassName, className, icon: Icon, isActive, label, ...props }: NavButtonProps) => {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-start p-2 text-slate-700 hover:text-slate-900 disabled:opacity-75 disabled:hover:cursor-not-allowed dark:text-slate-300 dark:hover:text-slate-100',
        className,
        isActive && (activeClassName ?? 'text-slate-900 dark:text-slate-100')
      )}
      type="button"
      {...props}
    >
      {Icon && <Icon className="mr-2" height={16} width={16} />}
      {label}
    </button>
  );
};
