import { cn } from '@douglasneuroinformatics/ui';

import { Logo } from '../Logo';

export type BrandingProps = {
  className?: string;
  logoVariant?: 'auto' | 'dark' | 'light';
  showText?: boolean;
};

export const Branding = ({ className, logoVariant = 'auto', showText = true }: BrandingProps) => {
  return (
    <div className={cn('flex h-10 items-center p-1 md:p-2', className)}>
      <Logo className="h-full w-auto" variant={logoVariant} />
      {showText && (
        <span className="font-lg ml-3 whitespace-nowrap font-bold leading-tight subpixel-antialiased">
          Open Data Capture
        </span>
      )}
    </div>
  );
};
