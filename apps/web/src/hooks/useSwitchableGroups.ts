import type { Group } from '@opendatacapture/schemas/group';
import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@/store';

import { groupsQueryOptions } from './useGroupsQuery';

/**
 * The groups the current user may make their current group. An admin may act in any group on the
 * platform, not only the ones they belong to, so theirs are fetched; until that resolves they fall back
 * to their own, so the switcher never blanks out while the chrome around it is already on screen.
 */
export function useSwitchableGroups(): Group[] {
  const currentUser = useAppStore((store) => store.currentUser);
  const isAdmin = currentUser?.ability.can('manage', 'all') ?? false;
  const groupsQuery = useQuery({ ...groupsQueryOptions(), enabled: isAdmin });

  if (!currentUser) {
    return [];
  }
  if (isAdmin && groupsQuery.data) {
    return groupsQuery.data;
  }
  return currentUser.groups;
}
