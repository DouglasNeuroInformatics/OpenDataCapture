/** @import { Plugin } from '@oxlint/plugins' */

import { classNameComposition } from './rules/class-name-composition.js';
import { handlerNames } from './rules/handler-names.js';
import { multilineArrowBody } from './rules/multiline-arrow-body.js';
import { noCoverageIgnore } from './rules/no-coverage-ignore.js';
import { requireDisableReason } from './rules/require-disable-reason.js';
import { requireRouteAccess } from './rules/require-route-access.js';
import { routeExports } from './rules/route-exports.js';
import { testToolingInTestsFolder } from './rules/test-tooling-in-tests-folder.js';
import { unitTestNamesSubject } from './rules/unit-test-names-subject.js';
import { unitTestSubject } from './rules/unit-test-subject.js';

/** @type {Plugin} */
const plugin = {
  meta: {
    name: 'opendatacapture'
  },
  rules: {
    'class-name-composition': classNameComposition,
    'handler-names': handlerNames,
    'multiline-arrow-body': multilineArrowBody,
    'no-coverage-ignore': noCoverageIgnore,
    'require-disable-reason': requireDisableReason,
    'require-route-access': requireRouteAccess,
    'route-exports': routeExports,
    'test-tooling-in-tests-folder': testToolingInTestsFolder,
    'unit-test-names-subject': unitTestNamesSubject,
    'unit-test-subject': unitTestSubject
  }
};

export default plugin;
