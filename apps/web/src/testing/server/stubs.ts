import { PureAbility, createMongoAbility } from '@casl/ability';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import type { Session } from '@opendatacapture/schemas/session';
import type { Subject } from '@opendatacapture/schemas/subject';
import type { User } from '@opendatacapture/schemas/user';

import type { CurrentUser } from '@/store/types';

export const adminUser: User = Object.freeze({
  basePermissionLevel: 'ADMIN',
  createdAt: new Date(),
  firstName: 'David',
  groupIds: [],
  groups: [],
  id: '12345',
  lastName: 'Roper',
  password: 'Password123',
  updatedAt: new Date(),
  username: 'david'
});

export const testSubject: Subject = Object.freeze({
  createdAt: new Date(),
  dateOfBirth: new Date(),
  firstName: 'testSubject',
  groupIds: [],
  id: '231314',
  lastName: 'tester',
  sex: 'MALE',
  updatedAt: new Date()
});

export const currentUser: CurrentUser = Object.freeze({
  ability: createMongoAbility<PureAbility<[AppAction, AppSubjectName], any>>([{ action: 'manage', subject: 'all' }]),
  firstName: 'Jane',
  groups: [],
  lastName: 'Doe',
  username: 'JaneDoe'
});

export const currentSession: Session = Object.freeze({
  createdAt: new Date(),
  date: new Date(),
  groupId: '123',
  id: '123',
  subject: {
    createdAt: new Date(),
    dateOfBirth: new Date(2000),
    firstName: 'Bob',
    groupIds: [],
    id: '123',
    lastName: 'Smith',
    sex: 'MALE' as const,
    updatedAt: new Date()
  },
  subjectId: '123',
  type: 'IN_PERSON',
  updatedAt: new Date()
});
