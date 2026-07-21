import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

export const GroupSwitcher = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();

  if (!currentGroup || !currentUser || currentUser.groups.length === 0) {
    return null;
  }

  const isSingleGroup = currentUser.groups.length === 1;

  return (
    <div
      className="bg-background/80 sticky top-0 z-20 hidden items-center justify-end px-4 py-2 backdrop-blur-lg md:flex md:h-16"
      data-testid="group-switcher"
    >
      <div className="w-[180px]">
        {isSingleGroup ? (
          <div
            className="relative flex h-auto w-full flex-col items-start overflow-hidden rounded-md border border-sky-700 bg-slate-800 px-3 py-1.5 font-semibold text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-sky-400 before:content-['']"
            data-testid="group-switcher-select"
          >
            <span className="text-[10px] font-medium tracking-tight text-sky-400">
              {t({ en: 'Group', fr: 'Groupe' })}
            </span>
            <span className="text-[14px]">{currentGroup.name}</span>
          </div>
        ) : (
          <Select
            value={currentGroup.id}
            onValueChange={(id) => changeGroup(currentUser.groups.find((group) => group.id === id)!)}
          >
            <Select.Trigger
              className="relative h-auto w-full overflow-hidden border border-sky-700 bg-slate-800 py-1.5 text-[14px] font-semibold text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-sky-400 before:content-[''] hover:bg-slate-700 [&>svg]:text-white [&>svg]:opacity-100"
              data-testid="group-switcher-select"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-medium tracking-tight text-sky-400">
                  {t({ en: 'Group', fr: 'Groupe' })}
                </span>
                <Select.Value />
              </div>
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {currentUser.groups.map((group) => (
                  <Select.Item key={group.id} value={group.id}>
                    {group.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
        )}
      </div>
    </div>
  );
};
