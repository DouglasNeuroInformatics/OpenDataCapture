import { noCoverageIgnore } from '../no-coverage-ignore.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-coverage-ignore', noCoverageIgnore, {
  invalid: [
    { code: '/* v8 ignore next */\nrun();', errors: [{ line: 1, messageId: 'coverageIgnore' }] },
    { code: '/* istanbul ignore else */\nrun();', errors: [{ messageId: 'coverageIgnore' }] },
    { code: '// c8 ignore next\nrun();', errors: [{ messageId: 'coverageIgnore' }] },
    { code: '/**\n * v8 ignore start\n */\nrun();', errors: [{ messageId: 'coverageIgnore' }] },
    { code: '/* v8 ignore start */\nrun();\n/* v8 ignore stop */', errors: 2 }
  ],
  valid: ['// the v8 ignore comment is forbidden\nrun();', '/* v8 ignored */\nrun();', 'run();']
});
