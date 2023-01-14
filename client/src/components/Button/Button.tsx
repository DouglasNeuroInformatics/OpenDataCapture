import React from 'react';

import classNames from 'classnames';

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'primary' | 'secondary';
}

/** This is a button */
const Button = ({ label, variant = 'primary', ...props }: ButtonProps) => {
  return (
    <button
      className={classNames(
        'inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        {
          'text-blue-900': variant === 'primary',
          'text-blue-600': variant === 'secondary'
        }
      )}
      {...props}
    >
      {label}
    </button>
  );
};

export { Button as default, type ButtonProps };
