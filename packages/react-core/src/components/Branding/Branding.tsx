import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

import { Logo } from '../Logo';

export type BrandingProps = {
  className?: string;
  logoVariant?: 'auto' | 'dark' | 'light';
};

export const Branding = ({ className, logoVariant = 'auto' }: BrandingProps) => {
  return (
    <div className={cn('flex h-10 items-center p-1', className)}>
      <Logo className="h-full w-auto" variant={logoVariant} />
      <span className="font-lg ml-3 whitespace-nowrap font-bold leading-tight subpixel-antialiased">
        Open Data Capture
      </span>
    </div>
  );
};
