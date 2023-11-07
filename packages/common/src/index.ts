/**
 * This is setup to be deliberately verbose to discourage people from
 * using imports via this file. The only purpose of this file is to define
 * the global environment for instruments, as TypeScript requires Node10 resolution
 * when module is None. In our other apps, we should continue to use the modern
 * resolution strategy I setup, e.g., import { foo } from '@open-data-capture/common/core'
 */

export * as Assignment from './assignment/assignment.index';
export * as Auth from './auth/auth.index';
export * as Core from './core/core.index';
export * as Group from './group/group.index';
export * as Instrument from './instrument/instrument.index';
export * as Setup from './setup/setup.index';
export * as Summary from './summary/summary.index';
export * as User from './user/user.index';
export * as Visit from './visit/visit.index';
