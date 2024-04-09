import React from 'react';

import { Card, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';

export type FormPageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth: 'lg' | 'md' | 'sm';
  title: string;
};

/** Standalone page used as a wrapper for forms (e.g., on login page) */
export const FormPageLayout = ({ children, className, maxWidth = 'sm', title }: FormPageLayoutProps) => {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
      <Card
        className={cn(
          'w-full',
          maxWidth === 'sm' && 'sm:max-w-sm',
          maxWidth === 'md' && 'sm:max-w-lg',
          maxWidth === 'lg' && 'sm:max-w-2xl'
        )}
      >
        <Card.Header className="flex items-center justify-center">
          <Logo className="m-2 h-auto w-16" variant="auto" />
          <Heading variant="h2">{title}</Heading>
        </Card.Header>
        <Card.Content>{children}</Card.Content>
        <Card.Footer className="text-muted-foreground flex justify-between">
          <p className="text-sm tracking-tighter">&copy; {new Date().getFullYear()} Douglas Neuroinformatics</p>
          <div className="flex gap-1">
            <LanguageToggle
              align="start"
              options={{
                en: 'English',
                fr: 'Français'
              }}
              triggerClassName="border"
              variant="ghost"
            />
            <ThemeToggle className="border" variant="ghost" />
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};
