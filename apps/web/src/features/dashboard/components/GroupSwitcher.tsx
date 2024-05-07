import React from 'react';

import { Select } from '@douglasneuroinformatics/libui/components';

import { useAppStore } from '@/store';

export const GroupSwitcher = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  // unless the user is an admin, this is set at login
  if (!currentGroup) {
    return null;
  }

  return (
    <Select
      value={currentGroup.id}
      onValueChange={(id) => changeGroup(currentUser!.groups.find((group) => group.id === id)!)!}
    >
      <Select.Trigger className="w-[180px]">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {currentUser?.groups.map((group) => (
            <Select.Item key={group.id} value={group.id}>
              {group.name}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
