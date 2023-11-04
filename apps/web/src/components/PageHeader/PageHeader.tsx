import { twMerge } from 'tailwind-merge';

export type PageHeaderProps = {
  className?: string;
  title: string;
};

export const PageHeader = ({ className, title }: PageHeaderProps) => {
  return (
    <div className={twMerge('my-3 w-full', className)}>
      <h2 className="my-4 text-center text-2xl font-bold text-slate-900 dark:text-slate-100 md:mb-6 lg:text-3xl">
        {title}
      </h2>
      <hr className="my-5 w-full border-slate-200 dark:border-slate-700" />
    </div>
  );
};
