import { testToolingInTestsFolder } from '../test-tooling-in-tests-folder.js';
import { ruleTester } from './rule-tester.js';

const SOURCE_FILE = '/repo/src/user.ts';

const TEST_FILE = '/repo/src/__tests__/user.test.ts';

ruleTester.run('test-tooling-in-tests-folder', testToolingInTestsFolder, {
  invalid: [
    {
      code: 'import { vi } from "vitest";',
      errors: [{ data: { source: 'vitest' }, messageId: 'testTooling' }],
      filename: SOURCE_FILE
    },
    { code: 'import { defineConfig } from "vitest/config";', errors: 1, filename: SOURCE_FILE },
    { code: 'import { render } from "@testing-library/react";', errors: 1, filename: SOURCE_FILE },
    { code: 'import "@testing-library/jest-dom/vitest";', errors: 1, filename: SOURCE_FILE }
  ],
  valid: [
    { code: 'import { vi } from "vitest";', filename: TEST_FILE },
    { code: 'import { z } from "zod/v4";', filename: SOURCE_FILE },
    { code: 'import { plugin } from "vitest-plugin";', filename: SOURCE_FILE },
    { code: 'import { x } from "@testing-library";', filename: SOURCE_FILE }
  ]
});
