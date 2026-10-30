import { Tabs } from '@douglasneuroinformatics/libui/components';

type SectionTab<TValue extends string> = {
  label: string;
  value: TValue;
};

type SectionTabsProps<TValue extends string> = {
  /** Set on the list; each tab gets it suffixed with its own value. */
  'data-testid': string;
  onValueChange: (value: TValue) => void;
  tabs: readonly SectionTab<TValue>[];
  value: TValue;
};

/**
 * Switches between the sections of a page. Only the tab row is rendered: the caller renders the
 * section for `value`, so it can keep that section's state when the tab is left and returned to.
 */
export const SectionTabs = <TValue extends string>({
  'data-testid': testId,
  onValueChange,
  tabs,
  value
}: SectionTabsProps<TValue>) => (
  <Tabs value={value} onValueChange={(selected) => onValueChange(tabs.find((tab) => tab.value === selected)!.value)}>
    {/* Underlined rather than libui's filled pill: the pill is one page tint on another, and the
        rule keeps to the surrounding card's own vocabulary. */}
    <Tabs.List
      className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0"
      data-testid={testId}
    >
      {tabs.map((tab) => (
        <Tabs.Trigger
          className="text-muted-foreground hover:text-foreground data-[state=active]:text-foreground -mb-px rounded-none border-b-2 border-transparent px-1 pt-1 pb-3 font-semibold data-[state=active]:border-slate-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-sky-500"
          data-testid={`${testId}-${tab.value}`}
          key={tab.value}
          value={tab.value}
        >
          {tab.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  </Tabs>
);
