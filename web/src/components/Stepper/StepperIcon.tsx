import React from 'react';

import { clsx } from 'clsx';

export interface StepperIconProps {
  icon: React.ReactElement;
  label: string;
  variant: 'dark' | 'light';
}

export const StepperIcon = ({ icon, label, variant = 'light' }: StepperIconProps) => {
  return (
    <div>
      <div className="relative flex items-center">
        <div
          className={clsx(
            'h-12 w-12 rounded-full border-2 border-slate-600 py-3 transition duration-500 ease-in-out [&>*]:h-full [&>*]:w-full',
            {
              'bg-slate-600 text-white': variant === 'dark',
              'text-slate-600': variant === 'light'
            }
          )}
        >
          {icon}
        </div>
        <div className="absolute top-0 -ml-10 mt-16 w-32 text-center text-xs font-medium uppercase text-slate-600">
          {label}
        </div>
      </div>
    </div>
  );
};
