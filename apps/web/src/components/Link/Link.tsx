import { clsx } from 'clsx';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

export type LinkProps = {
  variant?: 'btn-primary' | 'btn-secondary' | 'default';
} & RouterLinkProps;

export const Link = ({ children, className, variant = 'default', ...props }: LinkProps) => {
  return (
    <RouterLink
      className={clsx(
        'px-6 py-2',
        {
          'btn btn-primary': variant === 'btn-primary',
          'btn btn-secondary': variant === 'btn-secondary',
          'text-slate-600 hover:text-slate-900': variant === 'default'
        },
        className
      )}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
