import React from 'react';

import { Card, HoverCard, Separator } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { CircleHelpIcon } from 'lucide-react';

import { sortByLabel } from '@/utils/sort-by-label';

export type SettingsSection = {
  content: React.ReactNode;
  label: string;
};

export type SettingsCardProps = {
  sections: readonly SettingsSection[];
};

export const SettingsCard = ({ sections }: SettingsCardProps) => (
  <Card>
    <Card.Content className="p-0">
      {sortByLabel(sections).map(({ content, label }, index) => (
        <React.Fragment key={label}>
          {index > 0 && <Separator />}
          <section className="flex flex-col gap-4 p-6" data-testid="settings-section">
            <h3 className="text-base font-semibold">{label}</h3>
            {content}
          </section>
        </React.Fragment>
      ))}
    </Card.Content>
  </Card>
);

export type SettingRow = {
  control: React.ReactNode;
  help: string;
  label: string;
};

export type SettingRowsProps = {
  rows: readonly SettingRow[];
};

export const SettingRows = ({ rows }: SettingRowsProps) => (
  <React.Fragment>
    {sortByLabel(rows).map(({ control, help, label }) => (
      <div className="flex items-center justify-between gap-4" data-testid="setting-row" key={label}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <HoverCard>
            <HoverCard.Trigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
                <CircleHelpIcon className="h-4 w-4" />
              </button>
            </HoverCard.Trigger>
            <HoverCard.Content className="w-72 text-sm">{help}</HoverCard.Content>
          </HoverCard>
        </div>
        {control}
      </div>
    ))}
  </React.Fragment>
);

export type SettingToggleProps = {
  checked: boolean;
  /** Names the switch for assistive technology. */
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

/** libui ships no Switch, so this is hand-rolled. */
export const SettingToggle = ({ checked, label, onCheckedChange }: SettingToggleProps) => (
  <button
    aria-checked={checked}
    aria-label={label}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
      checked ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'
    )}
    role="switch"
    type="button"
    onClick={() => onCheckedChange(!checked)}
  >
    <span
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-slate-200 shadow-lg ring-0 transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
);
