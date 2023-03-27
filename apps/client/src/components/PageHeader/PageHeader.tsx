import React from 'react';

import { Divider } from '@/components';

export interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="my-3 w-full">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl">{title}</h2>
      <p className="text-center text-gray-500 md:text-lg">{description}</p>
      <Divider />
    </div>
  );
};
