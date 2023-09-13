// @ts-check

/** @type {import('@open-data-capture/types').Group[]} */
export const demoGroups = [
  {
    name: 'Depression Clinic'
  },
  {
    name: 'Psychosis Clinic'
  }
];

/** @type {import('.').DemoUser[]} */
export const demoUsers = [
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
