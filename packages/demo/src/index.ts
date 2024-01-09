import { deepFreeze } from '@douglasneuroinformatics/utils';
import type { Group } from '@open-data-capture/common/group';
import type { User } from '@open-data-capture/common/user';

type DemoUser = Pick<User, 'basePermissionLevel' | 'firstName' | 'lastName' | 'password' | 'username'> & {
  groupNames: readonly string[];
};

type DemoGroup = Pick<Group, 'name'>;

export const DEMO_GROUPS: readonly DemoGroup[] = deepFreeze([
  {
    name: 'Depression Clinic'
  },
  {
    name: 'Psychosis Clinic'
  }
]);

export const DEMO_USERS: readonly DemoUser[] = deepFreeze([
  {
    basePermissionLevel: 'GROUP_MANAGER',
    firstName: 'Jane',
    groupNames: ['Depression Clinic', 'Psychosis Clinic'],
    lastName: 'Doe',
    password: 'DataCapture2023',
    username: 'JaneDoe'
  },
  {
    basePermissionLevel: 'GROUP_MANAGER',
    firstName: 'John',
    groupNames: ['Depression Clinic'],
    lastName: 'Smith',
    password: 'DataCapture2023',
    username: 'JohnSmith'
  },
  {
    basePermissionLevel: 'STANDARD',
    firstName: 'François',
    groupNames: ['Psychosis Clinic'],
    lastName: 'Bouchard',
    password: 'DataCapture2023',
    username: 'FrançoisBouchard'
  }
]);
