import { multilineArrowBody } from '../multiline-arrow-body.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('multiline-arrow-body', multilineArrowBody, {
  invalid: [
    {
      code: 'const total = (items) =>\n  items.reduce((sum, item) => sum + item, 0);',
      errors: [{ line: 2, messageId: 'block' }],
      output: 'const total = (items) =>\n  { return items.reduce((sum, item) => sum + item, 0); };'
    },
    {
      code: 'const run = () => ((\n  start()\n));',
      errors: [{ messageId: 'block' }],
      output: 'const run = () => { return start(); };'
    },
    {
      code: 'const check = (value) => value > 0 &&\n  value < 10;',
      errors: [{ messageId: 'block' }],
      output: 'const check = (value) => { return value > 0 &&\n  value < 10; };'
    },
    {
      code: 'const run = () =>\n  start()',
      errors: [{ messageId: 'block' }],
      output: 'const run = () =>\n  { return start(); }'
    }
  ],
  valid: [
    'const double = (value) => value * 2;',
    'const run = () => {\n  start();\n};',
    'const point = () => ({\n  x: 1\n});',
    'const list = () => [\n  1\n];',
    'const text = () => `\n  line\n`;',
    'const view = () => (\n  <div />\n);',
    'const view = () => <>\n  <div />\n</>;'
  ]
});
