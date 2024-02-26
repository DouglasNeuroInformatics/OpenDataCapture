import { cn } from '@douglasneuroinformatics/ui';

export type NavButtonProps = {
  [key: `data-${string}`]: unknown;
  activeClassName?: string;
  className?: string;
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  isActive: boolean;
  label: string;
  onClick?: () => void;
  variant: 'horizontal' | 'vertical';
};

export const NavButton = ({
  activeClassName,
  className,
  icon: Icon,
  isActive,
  label,
  variant,
  ...props
}: NavButtonProps) => {
  return (
    <button
      className={cn(
        'flex w-full items-center p-2 text-slate-700 hover:text-slate-900 disabled:opacity-75 disabled:hover:cursor-not-allowed dark:text-slate-300 dark:hover:text-slate-100',
        {
          'justify-start': variant === 'vertical',
          'mx-1 justify-center': variant === 'horizontal'
        },
        className,
        isActive && (activeClassName ?? 'text-slate-900 dark:text-slate-100')
      )}
      type="button"
      {...props}
    >
      {Icon && (
        <Icon
          className={cn('mr-2', {
            hidden: variant === 'horizontal'
          })}
          height={16}
          width={16}
        />
      )}
      {label}
    </button>
  );
};
