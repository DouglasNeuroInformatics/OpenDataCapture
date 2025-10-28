import type { InitAppOptions } from '@opendatacapture/schemas/setup';

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
