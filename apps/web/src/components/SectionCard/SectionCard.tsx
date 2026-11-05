import type React from 'react';

import { InstanceCard } from '@/components/InstanceCard';

export type SectionCardProps = {
  children: React.ReactNode;
  'data-testid'?: string;
};

export const SectionCard = ({ children, 'data-testid': testId }: SectionCardProps) => (
  <InstanceCard className="rounded-2xl p-6" data-testid={testId}>
    {children}
  </InstanceCard>
);
