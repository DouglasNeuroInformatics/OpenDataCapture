import type { InitAppOptions } from '@opendatacapture/schemas/setup';

/** The admin account created during global setup; role fixtures log in with these credentials. */
export const ADMIN = {
  firstName: 'Jane',
  lastName: 'Doe',
  password: 'DataCapture2025',
  username: 'admin'
} as const;

export const INIT_APP_OPTIONS = {
  admin: ADMIN,
  dummySubjectCount: 10,
  enableExperimentalFeatures: false,
  initDemo: true,
  recordsPerSubject: 10
} satisfies InitAppOptions;

/** Password used for every seeded (non-admin) user; must satisfy the app's complexity rules. */
export const SEEDED_USER_PASSWORD = 'DataCapture2025_Test';
