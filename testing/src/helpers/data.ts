import type { CreateGroupData } from '@opendatacapture/schemas/group';
import type { InitAppOptions } from '@opendatacapture/schemas/setup';
import type { CreateUserData } from '@opendatacapture/schemas/user';

import type { TestDataMap } from './types';

export const initAppOptions = {
  admin: {
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'DataCapture2025',
    username: 'admin'
  },
  dummySubjectCount: 10,
  enableExperimentalFeatures: false,
  initDemo: true,
  recordsPerSubject: 10
} satisfies InitAppOptions;

export const groups: TestDataMap<CreateGroupData> = {
  'Desktop Chrome': {
    name: 'Clinical Group',
    type: 'CLINICAL'
  },
  'Desktop Firefox': {
    name: 'Research Group',
    type: 'RESEARCH'
  }
};

export const users: TestDataMap<Omit<CreateUserData, 'groupIds'>> = {
  'Desktop Chrome': {
    basePermissionLevel: 'GROUP_MANAGER',
    firstName: 'John',
    lastName: 'Smith',
    password: 'DataCapture2026_User1',
    username: 'john_smith'
  },
  'Desktop Firefox': {
    basePermissionLevel: 'GROUP_MANAGER',
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'DataCapture2026_User2',
    username: 'jane_doe'
  }
};
