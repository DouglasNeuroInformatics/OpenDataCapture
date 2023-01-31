import React from 'react';

import { clsx } from 'clsx';

interface DividerProps extends React.ComponentPropsWithoutRef<'div'> {
  variant?: 'light' | 'dark';
}

export const Divider = ({ className, variant = 'light', ...props }: DividerProps) => {
  return <hr className={clsx({ 'border-slate-300': variant === 'light' }, 'my-5 w-full', className)} {...props} />;
};
