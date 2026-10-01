import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';

import { useSwitchableGroups } from '@/hooks/useSwitchableGroups';
import { useAppStore } from '@/store';

/**
 * Shared by both variants below, so a single-group user sees the same control as a multi-group one.
 * The `before:` pseudo-element is the sky accent bar down the left edge.
 */
const SURFACE_CLASSNAME =
  "relative h-auto w-full overflow-hidden border border-sky-700 bg-slate-800 py-1.5 font-semibold text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-sky-400 before:content-['']";

/**
 * Whether the switcher will render anything. Call sites that draw chrome around it — a separator, a
 * sticky bar — need the same answer before laying that chrome out, otherwise they leave an empty
 * container behind for a user with no group to switch to.
 */
export function useIsGroupSwitcherVisible() {
  return useSwitchableGroups().length > 0;
}

/**
 * The current group, and (when there is more than one to choose from) a control to switch between them.
 * Renders the control alone with no surrounding layout: the sidebar, the mobile nav sheet, and the top
 * bar each place it differently, so spacing and width belong to the caller via `className`.
 */
export const GroupSwitcher = ({ className }: { className?: string }) => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const groups = useSwitchableGroups();
  const { t } = useTranslation();

  if (groups.length === 0) {
    return null;
  }

  const label = (
    <span className="text-[10px] font-medium tracking-tight text-sky-400">
      {t({ en: 'Group', es: 'Grupo', fr: 'Groupe' })}
    </span>
  );

  // A user with exactly one group, already selected, has nothing to switch between, so show the group as
  // static text styled to match the trigger, rather than a select whose only option is the current value.
  if (groups.length === 1 && currentGroup) {
    return (
      <div
        className={cn(SURFACE_CLASSNAME, 'flex flex-col items-start rounded-md px-3', className)}
        data-testid="group-switcher"
      >
        {label}
        <span className="text-[14px]">{currentGroup.name}</span>
      </div>
    );
  }

  // An admin who belongs to no group starts with none selected. Radix shows the placeholder only for an
  // empty-string value; `undefined` would flip the select to uncontrolled once a group is chosen.
  return (
    <Select
      value={currentGroup?.id ?? ''}
      onValueChange={(id) => changeGroup(groups.find((group) => group.id === id)!)}
    >
      <Select.Trigger
        className={cn(
          SURFACE_CLASSNAME,
          'text-[14px] hover:bg-slate-700 [&>svg]:text-white [&>svg]:opacity-100',
          className
        )}
        data-testid="group-switcher"
      >
        <div className="flex flex-col items-start leading-tight">
          {label}
          <Select.Value
            placeholder={t({ en: 'Select a group', es: 'Seleccione un grupo', fr: 'Sélectionnez un groupe' })}
          />
        </div>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {groups.map((group) => (
            <Select.Item key={group.id} value={group.id}>
              {group.name}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
