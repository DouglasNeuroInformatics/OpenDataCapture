import React, { ForwardedRef } from 'react';

import { clsx } from 'clsx';

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  icon?: React.ReactElement;
  iconPosition?: 'left' | 'right';
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export const Button = React.forwardRef(function Button(
  { className, icon, label, iconPosition = 'left', size = 'md', variant = 'dark', ...props }: ButtonProps,
  ref?: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      className={clsx(className, 'btn', {
        'py-2 px-4 text-sm': size === 'sm',
        'text-md py-2 px-6': size === 'md',
        'py-3 px-8 text-lg': size === 'lg',
        'btn-dark': variant === 'dark',
        'btn-light': variant === 'light'
      })}
      ref={ref}
      {...props}
    >
      {iconPosition === 'left' && icon && <div className="mr-2">{icon}</div>}
      {label}
      {iconPosition === 'right' && icon && <div className="ml-2">{icon}</div>}
    </button>
  );
});
