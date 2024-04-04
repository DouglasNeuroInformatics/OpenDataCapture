import React from 'react';

import { Card, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';

export type FormPageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth: 'lg' | 'md' | 'sm';
  title: string;
};

/** Standalone page used as a wrapper for forms (e.g., on login page) */
export const FormPageLayout = ({ children, className, maxWidth = 'sm', title }: FormPageLayoutProps) => (
  <div className={cn('flex min-h-screen items-center justify-center', className)}>
    <Card
      className={cn(
        'm-5 flex w-full flex-col items-center rounded-2xl p-8',
        maxWidth === 'sm' && 'sm:max-w-sm',
        maxWidth === 'md' && 'sm:max-w-lg',
        maxWidth === 'lg' && 'sm:max-w-2xl'
      )}
    >
      <Logo className="m-3 h-auto w-16" variant="auto" />
      <h1 className="mb-3 text-2xl font-bold tracking-tight first-letter:capitalize">{title}</h1>
      {children}
      <div className="flex w-full justify-between bg-inherit">
        <LanguageToggle
          align="start"
          options={{
            en: 'English',
            fr: 'Français'
          }}
        />
        <ThemeToggle />
      </div>
    </Card>
  </div>
);
