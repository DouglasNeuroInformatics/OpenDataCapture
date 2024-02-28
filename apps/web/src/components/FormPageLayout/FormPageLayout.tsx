import React from 'react';

import { Card, LanguageToggle, ThemeToggle, cn } from '@douglasneuroinformatics/ui';

import logo from '@/assets/logo.png';

export type FormPageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  title: string;
  widthMultiplier?: number;
};

/** Standalone page used as a wrapper for forms (e.g., on login page) */
export const FormPageLayout = ({ children, className, title, widthMultiplier = 1 }: FormPageLayoutProps) => (
  <div className={cn('flex min-h-screen items-center justify-center', className)}>
    <Card className="m-5 flex flex-col items-center rounded-2xl p-8" style={{ width: `${24 * widthMultiplier}rem` }}>
      <img alt="logo" className="m-2 h-auto w-16" src={logo} />
      <h1 className="mb-3 text-2xl font-bold tracking-tight first-letter:capitalize">{title}</h1>
      {children}
      <div className="mt-5 flex w-full justify-between bg-inherit">
        <LanguageToggle dropdownDirection="up" options={['en', 'fr']} />
        <ThemeToggle />
      </div>
    </Card>
  </div>
);
