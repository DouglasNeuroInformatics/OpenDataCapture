import { deepFreeze } from '@douglasneuroinformatics/libjs';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';

type DemoUser = {
  groupNames: readonly string[];
} & Pick<User, 'basePermissionLevel' | 'firstName' | 'lastName' | 'password' | 'username'>;

type DemoGroup = Pick<Group, 'name' | 'type'>;

export const DEMO_GROUPS: readonly DemoGroup[] = deepFreeze([
  {
    name: 'Depression Clinic',
    type: 'CLINICAL'
  },
  {
    name: 'Psychosis Lab',
    type: 'RESEARCH'
  }
]);

export const DEMO_USERS: readonly DemoUser[] = deepFreeze([
  {
    basePermissionLevel: 'GROUP_MANAGER',
    firstName: 'Jane',
    groupNames: ['Depression Clinic', 'Psychosis Lab'],
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
    groupNames: ['Psychosis Lab'],
    lastName: 'Bouchard',
    password: 'DataCapture2023',
    username: 'FrançoisBouchard'
  }
]);
