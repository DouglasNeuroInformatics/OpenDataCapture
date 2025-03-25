import { deepFreeze } from '@douglasneuroinformatics/libjs';
import type { CreateGroupData } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';

type DemoUser = Pick<User, 'basePermissionLevel' | 'firstName' | 'lastName' | 'username'> & {
  groupNames: readonly string[];
  password: string;
};

type DemoGroup = CreateGroupData & { dummyIdPrefix?: string };

export const DEMO_GROUPS: readonly DemoGroup[] = deepFreeze([
  {
    name: 'Depression Clinic',
    type: 'CLINICAL'
  },
  {
    dummyIdPrefix: 'ex_',
    name: 'Psychosis Lab',
    settings: {
      defaultIdentificationMethod: 'CUSTOM_ID',
      idValidationRegex: String.raw`^ex_\d+$`,
      idValidationRegexErrorMessage: {
        en: "Must start with 'ex_' followed by one or more digits",
        fr: "Doit commencer par « ex_ » suivi d'un ou plusieurs chiffres"
      }
    },
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
