import { createMongoAbility, PureAbility } from '@casl/ability';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import type { Session } from '@opendatacapture/schemas/session';

import type { CurrentUser } from '@/store/types';

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
