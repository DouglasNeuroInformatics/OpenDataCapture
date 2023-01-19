import React from 'react';

import clsx from 'clsx';

interface PaginationButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  active?: boolean;
}

export const PaginationButton = ({ active, children, className, ...props }: PaginationButtonProps) => {
  return (
    <button
      className={clsx(
        'flex h-8 w-8 items-center justify-center rounded-full shadow-2xl hover:bg-slate-200',
        className,
        {
          'bg-blue-500': active,
          'bg-slate-50': !active
        }
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};
