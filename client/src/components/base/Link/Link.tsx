import React from 'react';

import clsx from 'clsx';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export interface LinkProps extends RouterLinkProps {
  variant: 'default' | 'btn-dark' | 'btn-light';
}

export const Link = ({ className, children, variant = 'default', ...props }: LinkProps) => {
  return (
    <RouterLink
      className={clsx(
        'py-2 px-6',
        {
          'text-cello-600 hover:text-cello-900': variant === 'default',
          'btn btn-dark': variant === 'btn-dark',
          'btn btn-light': variant === 'btn-light'
        },
        className
      )}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
