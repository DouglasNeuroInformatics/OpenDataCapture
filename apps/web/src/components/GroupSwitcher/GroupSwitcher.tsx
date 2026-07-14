import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useAppStore } from '@/store';

/**
 * Persistent group selector shown in the top-right of every authenticated page.
 * Lets a user switch the active group regardless of which page they're on.
 * Renders nothing for users without a selectable group (e.g. admins with no
 * group set), since there's nothing to switch between.
 */
export const GroupSwitcher = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();

  if (!currentGroup || !currentUser || currentUser.groups.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-background/80 sticky top-14 z-20 flex justify-end px-4 py-2 backdrop-blur-lg md:top-0"
      data-testid="group-switcher"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap text-sm font-medium">
          {t({ en: 'Current Group:', fr: 'Groupe actuel :' })}
        </span>
        <Select
          value={currentGroup.id}
          onValueChange={(id) => changeGroup(currentUser.groups.find((group) => group.id === id)!)}
        >
          <Select.Trigger
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary [&>svg]:text-primary-foreground/80 w-[180px] border-transparent [&>svg]:opacity-100"
            data-testid="group-switcher-select"
          >
            <Select.Value />
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
      </div>
    </div>
  );
};
