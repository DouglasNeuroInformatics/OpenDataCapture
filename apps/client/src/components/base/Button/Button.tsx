import React from 'react';

import clsx from 'clsx';

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  icon?: React.ReactElement;
  iconPosition?: 'left' | 'right';
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export const Button = ({
  className,
  icon,
  label,
  iconPosition = 'left',
  size = 'md',
  variant = 'dark',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(className, 'btn', {
        'py-2 px-4 text-sm': size === 'sm',
        'text-md py-2 px-6': size === 'md',
        'py-3 px-8 text-lg': size === 'lg',
        'btn-dark': variant === 'dark',
        'btn-light': variant === 'light'
      })}
      {...props}
    >
      {iconPosition === 'left' && icon}
      {label}
      {iconPosition === 'right' && icon}
    </button>
  );
};
