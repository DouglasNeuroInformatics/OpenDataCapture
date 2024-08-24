import { cn } from '@douglasneuroinformatics/libui/utils';

import { Logo } from '../Logo';

export type BrandingProps = {
  className?: string;
  fontSize?: 'lg' | 'md' | 'sm';
  logoVariant?: 'auto' | 'dark' | 'light';
  onClick?: () => void;
};

export const Branding = ({ className, fontSize = 'lg', logoVariant = 'auto', onClick }: BrandingProps) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={cn('flex h-10 items-center p-1', className)} onClick={onClick}>
      <Logo className="h-full w-auto" variant={logoVariant} />
      <span
        className={cn(
          'ml-3 whitespace-nowrap font-bold leading-tight subpixel-antialiased',
          fontSize === 'lg' && 'text-lg',
          fontSize === 'md' && 'text-base',
          fontSize === 'sm' && 'text-sm'
        )}
      >
        Open Data Capture
      </span>
    </div>
  );
};
