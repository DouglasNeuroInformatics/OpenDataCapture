import { unitTestSubject } from '../unit-test-subject.js';
import { ruleTester } from './rule-tester.js';

const USER_TEST = '/repo/packages/core/src/users/__tests__/user.test.ts';

const inUserTest = (code: string) => ({ code, filename: USER_TEST });

ruleTester.run('unit-test-subject', unitTestSubject, {
  invalid: [
    { ...inUserTest(''), errors: [{ data: { subject: 'user' }, line: 1, messageId: 'import' }] },
    { ...inUserTest('import { find } from "../other";'), errors: [{ messageId: 'import' }] },
    { ...inUserTest('import { find } from "user";'), errors: [{ messageId: 'import' }] },
    { ...inUserTest('import(1);\nimport(path);'), errors: [{ messageId: 'import' }] },
    {
      code: 'import { find } from "@/users/user";',
      errors: [{ messageId: 'import' }],
      filename: '/repo/lib/users/__tests__/user.test.ts'
    },
    {
      ...inUserTest('import { find } from "../user";\ndescribe("other", () => {});'),
      errors: [{ data: { subject: 'user' }, messageId: 'describe' }]
    },
    { ...inUserTest('import { find } from "../user";\ndescribe("findAll", () => {});'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe("user", () => {});'), errors: 1 },
    { ...inUserTest('import { default as user } from "../user";\ndescribe("default", () => {});'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe(other, () => {});'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe(`find`, () => {});'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe(1, () => {});'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe();'), errors: 1 },
    { ...inUserTest('import { find } from "../user";\ndescribe.each([])("other", () => {});'), errors: 1 },
    { ...inUserTest('const { ["find"]: find, ...rest } = await import("../user");\ndescribe("find");'), errors: 1 }
  ],
  valid: [
    { code: 'describe("anything");', filename: '/repo/packages/core/src/users/user.ts' },
    { code: 'describe("anything");', filename: '/repo/packages/core/src/users/user.test.ts' },
    inUserTest('import { find } from "../user";\ndescribe("find", () => {});\nit("works", () => {});\nconst x = 1;'),
    inUserTest('import { find } from "../user.js";\ndescribe("find.byId", () => {});'),
    inUserTest('import { find } from "@/users/user";\ndescribe.skip("find", () => {});'),
    inUserTest('import { find as lookup } from "../user";\ndescribe(lookup, () => {});'),
    inUserTest('import { "find" as lookup } from "../user";\ndescribe("find", () => {});'),
    inUserTest('import user from "../user";\ndescribe("user.find", () => {});'),
    inUserTest('import * as module from "../user";\ndescribe("user", () => {});'),
    inUserTest('import "../user";\ndescribe("user", () => {});'),
    inUserTest('const { find } = await import("../user");\ndescribe("find");'),
    inUserTest('const { find: lookup } = await import("../user");\ndescribe(lookup);'),
    inUserTest('const { "find": lookup } = await import("../user");\ndescribe("find");'),
    inUserTest('const { find = noop } = await import("../user");\ndescribe("find");'),
    inUserTest('const find = (await import("../user")).find;\ndescribe("find");'),
    inUserTest('import("../user").then(run);\ndescribe("then");'),
    inUserTest('const module = await import("../user");\ndescribe("user");'),
    inUserTest('(await import("../user"))[name];\ndescribe("user");'),
    { code: 'import "..";\ndescribe("index");', filename: '/repo/packages/core/src/users/__tests__/index.test.ts' }
  ]
});
