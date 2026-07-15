import { Select } from '@douglasneuroinformatics/libui/components';

import { useAppStore } from '@/store';

export const GroupSwitcher = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  if (!currentGroup || !currentUser || currentUser.groups.length === 0) {
    return null;
  }

  const isSingleGroup = currentUser.groups.length === 1;

  return (
    <div
      className="bg-background/80 sticky top-0 z-20 hidden items-center justify-end px-4 py-2 backdrop-blur-lg md:flex md:h-16"
      data-testid="group-switcher"
    >
      {isSingleGroup ? (
        <div
          className="bg-primary text-primary-foreground flex h-9 w-[180px] items-center justify-center rounded-md text-sm font-semibold"
          data-testid="group-switcher-select"
        >
          {currentGroup.name}
        </div>
      ) : (
        <Select
          value={currentGroup.id}
          onValueChange={(id) => changeGroup(currentUser.groups.find((group) => group.id === id)!)}
        >
          <Select.Trigger
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary [&>svg]:text-primary-foreground/80 w-[180px] border-transparent font-semibold [&>svg]:opacity-100"
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
      )}
    </div>
  );
};
