import { requireDisableReason } from '../require-disable-reason.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('require-disable-reason', requireDisableReason, {
  invalid: [
    { code: '// eslint-disable-next-line no-console\nconsole.log(1);', errors: [{ line: 1, messageId: 'reason' }] },
    { code: 'console.log(1); // eslint-disable-line no-console', errors: [{ messageId: 'reason' }] },
    { code: '/* eslint-disable no-console */', errors: [{ messageId: 'reason' }] },
    { code: '/* eslint-disable */', errors: [{ messageId: 'reason' }] },
    { code: '// oxlint-disable-next-line no-console\nconsole.log(1);', errors: [{ messageId: 'reason' }] },
    { code: 'console.log(1); // oxlint-disable-line no-console', errors: [{ messageId: 'reason' }] },
    { code: '/* oxlint-disable no-console */', errors: [{ messageId: 'reason' }] },
    { code: '// eslint-disable-next-line no-console --\nconsole.log(1);', errors: [{ messageId: 'reason' }] },
    { code: '// eslint-disable-next-line no-console --   \nconsole.log(1);', errors: [{ messageId: 'reason' }] }
  ],
  valid: [
    '// eslint-disable-next-line no-console -- the CLI prints its result\nconsole.log(1);',
    '// oxlint-disable-next-line no-console -- the CLI prints its result\nconsole.log(1);',
    '/* oxlint-disable no-console --- a script that only prints */',
    '// eslint-enable no-console',
    '// eslint-disabled-thing',
    '// A comment that mentions eslint-disable in passing'
  ]
});
