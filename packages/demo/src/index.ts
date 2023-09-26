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
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'JaneDoe',
    password: 'DataCapture2023',
    groupNames: ['Depression Clinic', 'Psychosis Clinic'],
    basePermissionLevel: 'GROUP_MANAGER'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    username: 'JohnSmith',
    password: 'DataCapture2023',
    groupNames: ['Depression Clinic'],
    basePermissionLevel: 'GROUP_MANAGER'
  },
  {
    firstName: 'François',
    lastName: 'Bouchard',
    username: 'FrançoisBouchard',
    password: 'DataCapture2023',
    groupNames: ['Psychosis Clinic'],
    basePermissionLevel: 'STANDARD'
  }
];
