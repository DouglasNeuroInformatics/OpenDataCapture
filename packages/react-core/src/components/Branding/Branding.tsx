import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

import { Logo } from '../Logo';

export type BrandingProps = {
  className?: string;
  fontSize?: 'lg' | 'md' | 'sm';
  logoVariant?: 'auto' | 'dark' | 'light';
};

export const Branding = ({ className, fontSize = 'lg', logoVariant = 'auto' }: BrandingProps) => {
  return (
    <div className={cn('flex h-10 items-center p-1', className)}>
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
