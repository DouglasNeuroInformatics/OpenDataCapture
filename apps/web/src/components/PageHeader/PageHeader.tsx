import React from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';

export type PageHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageHeader = ({ children, className }: PageHeaderProps) => {
  return (
    <React.Fragment>
      <div className={cn('mt-5 w-full', className)}>{children}</div>
      <Separator className="my-5 w-full" />
    </React.Fragment>
  );
};
