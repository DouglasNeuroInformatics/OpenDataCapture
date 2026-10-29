import { classNameComposition } from './class-name-composition.js';
import { handlerNames } from './handler-names.js';
import { multilineArrowBody } from './multiline-arrow-body.js';
import { noCoverageIgnore } from './no-coverage-ignore.js';
import { requireDisableReason } from './require-disable-reason.js';
import { routeExports } from './route-exports.js';
import { unitTestSubject } from './unit-test-subject.js';

export const rules = {
  'class-name-composition': classNameComposition,
  'handler-names': handlerNames,
  'multiline-arrow-body': multilineArrowBody,
  'no-coverage-ignore': noCoverageIgnore,
  'require-disable-reason': requireDisableReason,
  'route-exports': routeExports,
  'unit-test-subject': unitTestSubject
};
