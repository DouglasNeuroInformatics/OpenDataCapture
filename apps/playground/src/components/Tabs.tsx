import { cn } from '@douglasneuroinformatics/ui';

export type TabsProps = {
  tabs: {
    current: boolean;
    label: string;
  }[];
};

export const Tabs = ({ tabs }: TabsProps) => {
  return (
    <div>
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="tabs">
          Select View
        </label>
        <select
          className="block w-full rounded-md border border-slate-300 p-2 focus:border-sky-500 focus:ring-sky-500 dark:border-sky-600"
          defaultValue={tabs.find((tab) => tab.current)?.label}
          id="tabs"
          name="tabs"
        >
          {tabs.map((tab) => (
            <option key={tab.label}>{tab.label}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav
          aria-label="Tabs"
          className="relative z-0 flex divide-x divide-slate-200 rounded-lg shadow dark:divide-slate-700"
        >
          {tabs.map((tab, tabIdx) => (
            <div
              aria-current={tab.current ? 'page' : undefined}
              className={cn(
                tab.current ? 'text-slate-900' : 'text-slate-600 hover:text-slate-700',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden bg-white px-4 py-4 text-center text-sm font-medium hover:bg-slate-50 focus:z-10'
              )}
              key={tab.label}
            >
              <span>{tab.label}</span>
              <span
                aria-hidden="true"
                className={cn(tab.current ? 'bg-indigo-500' : 'bg-transparent', 'absolute inset-x-0 bottom-0 h-0.5')}
              />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
