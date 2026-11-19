/** @import { CreateRule } from '@oxlint/plugins' */

import * as path from 'node:path';

const TEST_TOOLING = /^(?:vitest|@testing-library\/[^/]+)(?:\/|$)/u;

/** @type {CreateRule} */
export const testToolingInTestsFolder = {
  create(context) {
    const folders = context.filename.split(path.sep);
    if (folders.includes('__tests__')) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        if (TEST_TOOLING.test(node.source.value)) {
          context.report({ data: { source: node.source.value }, messageId: 'testTooling', node });
        }
      }
    };
  },
  meta: {
    messages: {
      testTooling: "'{{source}}' is test tooling; only a file in a __tests__/ folder may import it."
    },
    schema: [],
    type: 'problem'
  }
};
