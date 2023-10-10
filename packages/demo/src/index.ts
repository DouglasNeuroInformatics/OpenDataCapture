import type { Group, User } from '@open-data-capture/types';

export type DemoUser = Omit<User, 'groups'> & {
  groupNames: string[];
};

export const demoGroups: Group[] = [
  {
    name: 'Depression Clinic'
  },
  {
    name: 'Psychosis Clinic'
  }
];

export const demoUsers: DemoUser[] = [
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
];
