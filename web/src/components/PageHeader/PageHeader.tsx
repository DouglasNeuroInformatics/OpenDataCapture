import React from 'react';

import { Divider } from '@douglasneuroinformatics/ui';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="my-3 w-full">
      <h2 className="my-4 text-center text-2xl font-bold text-slate-900 md:mb-6 lg:text-3xl">{title}</h2>
      <p className="text-center text-xl text-slate-700">{subtitle}</p>
      <Divider />
    </div>
  );
};
