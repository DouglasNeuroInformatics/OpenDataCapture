import React from 'react';

import { clsx } from 'clsx';

type StepperDividerProps = {
  variant: 'dark' | 'light';
}

export const StepperDivider = ({ variant = 'light' }: StepperDividerProps) => {
  return (
    <div
      className={clsx('flex-auto border-t-2 transition duration-500 ease-in-out', {
        'border-slate-600': variant === 'dark',
        'border-slate-300': variant === 'light'
      })}
    />
  );
};
