import { cn } from '@douglasneuroinformatics/ui/utils';

export type TabsProps<T extends string> = {
  activeTab: T;
  setActiveTab: (name: T) => void;
  tabs: {
    name: T;
  }[];
};

export const Tabs = <T extends string>({ activeTab, setActiveTab, tabs }: TabsProps<T>) => {
  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="tabs">
          Select View
        </label>
        <select
          className="block w-full border border-slate-300 bg-slate-50 p-2 focus:border-sky-500 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800"
          id="tabs"
          name="tabs"
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as T)}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className="relative z-0 flex divide-x divide-slate-200 shadow dark:divide-slate-700">
          {tabs.map((tab) => (
            <button
              className={cn(
                tab.name === activeTab
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200',
                'group relative min-w-0 flex-1 overflow-hidden bg-slate-50 px-4 py-4 text-center text-sm font-medium hover:bg-slate-100 focus:z-10 dark:bg-slate-800 dark:hover:bg-slate-700'
              )}
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(tab.name)}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
