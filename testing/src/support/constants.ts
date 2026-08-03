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

/**
 * The stored mail configuration every mail-touching helper and spec shares — one definition, so a
 * spec can never assert literals the seeding helper has moved away from. The host is unroutable
 * on purpose: nothing in this suite may ever deliver a real message, and the SMTP failure is
 * itself what the delivery specs assert on.
 */
export const E2E_MAIL_CONFIG = {
  encryption: 'starttls',
  host: 'smtp.invalid.test',
  password: 'e2e-password',
  port: 587,
  senderAddress: 'noreply@example.org',
  senderName: 'Open Data Capture',
  username: 'e2e'
} as const;
