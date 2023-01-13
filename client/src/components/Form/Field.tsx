import React from 'react';

import classNames from 'classnames';

interface FieldProps {
  children: React.ReactNode;
  name: string;
  label: string;
  isFloatingLabel: boolean;
  className?: string;
  error?: string;
}

const Field = ({ children, name, label, error, isFloatingLabel }: FieldProps) => {
  return (
    <React.Fragment>
      <div className="relative my-5 flex w-full flex-col">
        {children}
        <label
          className={classNames('absolute left-0 -z-50 my-2 text-gray-600 transition-all', {
            '-translate-y-5 text-sm text-indigo-800': isFloatingLabel
          })}
          htmlFor={name}
        >
          {label}
        </label>
      </div>
      {error && <span className="text-red-700">{error}</span>}
    </React.Fragment>
  );
};

export { Field as default, type FieldProps };
