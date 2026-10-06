import type React from 'react';

export type SectionCardProps = {
  children: React.ReactNode;
  'data-testid'?: string;
};

export const SectionCard = ({ children, 'data-testid': testId }: SectionCardProps) => (
  <div className="bg-card text-card-foreground border-border rounded-2xl border p-6 shadow-sm" data-testid={testId}>
    {children}
  </div>
);
