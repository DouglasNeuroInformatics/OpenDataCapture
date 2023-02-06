import React from 'react';

import clsx from 'clsx';

import { ErrorBox } from '../ErrorBox';

export interface FieldWrapperProps {
  children: React.ReactNode;
  name: string;
  label: string;
  isFloatingLabel: boolean;
  className?: string;
  error?: string;
}

export const FieldWrapper = ({ children, name, label, error, isFloatingLabel }: FieldWrapperProps) => {
  return (
    <React.Fragment>
      <div className="relative my-6 flex w-full flex-col">
        {children}
        <label
          className={clsx('pointer-events-none absolute left-0 my-2 text-gray-600 transition-all', {
            'z-10 -translate-y-5 text-sm text-indigo-800': isFloatingLabel
          })}
          htmlFor={name}
        >
          {label}
        </label>
      </div>
      <ErrorBox message={error} />
    </React.Fragment>
  );
};
