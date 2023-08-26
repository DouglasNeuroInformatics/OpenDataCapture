import React from 'react';

export type PageHeaderProps = {
  title: string;
};

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <div className="my-3 w-full">
      <h2 className="my-4 text-center text-2xl font-bold text-slate-900 dark:text-slate-100 md:mb-6 lg:text-3xl">
        {title}
      </h2>
      <hr className="my-5 w-full border-slate-200 dark:border-slate-700" />
    </div>
  );
};
