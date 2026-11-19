import * as path from 'node:path';

import { unitTestNamesSubject } from '../unit-test-names-subject.js';
import { ruleTester } from './rule-tester.js';

const inTestsFolder = (base: string) => path.join(import.meta.dirname, base);

ruleTester.run('unit-test-names-subject', unitTestNamesSubject, {
  invalid: [
    {
      code: '',
      errors: [{ messageId: 'outsideTestsFolder' }],
      filename: path.join(import.meta.dirname, '..', 'route-exports.test.ts')
    },
    {
      code: '',
      errors: [{ messageId: 'specSuffix' }],
      filename: inTestsFolder('route-exports.spec.ts')
    },
    {
      code: '',
      errors: [{ data: { subject: 'missing' }, messageId: 'noSubject' }],
      filename: inTestsFolder('missing.test.ts')
    },
    {
      code: '',
      errors: [{ messageId: 'specSuffix' }, { messageId: 'noSubject' }],
      filename: inTestsFolder('missing.spec.tsx')
    }
  ],
  valid: [
    { code: '', filename: inTestsFolder('route-exports.test.ts') },
    { code: '', filename: inTestsFolder('route-exports.test.jsx') },
    { code: '', filename: path.join(import.meta.dirname, '..', 'route-exports.js') }
  ]
});
