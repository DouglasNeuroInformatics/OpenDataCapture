import React from 'react';

import { clsx } from 'clsx';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export type LinkProps = {
  variant?: 'default' | 'btn-primary' | 'btn-secondary';
} & RouterLinkProps

export const Link = ({ className, children, variant = 'default', ...props }: LinkProps) => {
  return (
    <RouterLink
      className={clsx(
        'px-6 py-2',
        {
          'text-slate-600 hover:text-slate-900': variant === 'default',
          'btn btn-primary': variant === 'btn-primary',
          'btn btn-secondary': variant === 'btn-secondary'
        },
        className
      )}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
