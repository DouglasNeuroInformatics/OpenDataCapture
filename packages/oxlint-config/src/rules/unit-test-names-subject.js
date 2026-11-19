/** @import { CreateRule } from '@oxlint/plugins' */

import * as fs from 'node:fs';
import * as path from 'node:path';

const UNIT_TEST_FILENAME = /^(?<subject>.+)\.(?<suffix>test|spec)\.[jt]sx?$/u;

const SUBJECT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/** @type {CreateRule} */
export const unitTestNamesSubject = {
  create(context) {
    const { base, dir } = path.parse(context.filename);
    const { subject, suffix } = UNIT_TEST_FILENAME.exec(base)?.groups ?? {};
    if (subject === undefined) {
      return {};
    }
    return {
      Program(node) {
        if (path.basename(dir) !== '__tests__') {
          context.report({ messageId: 'outsideTestsFolder', node });
          return;
        }
        if (suffix === 'spec') {
          context.report({ messageId: 'specSuffix', node });
        }
        const subjectPath = path.join(dir, '..', subject);
        if (!SUBJECT_EXTENSIONS.some((extension) => fs.existsSync(subjectPath + extension))) {
          context.report({ data: { subject }, messageId: 'noSubject', node });
        }
      }
    };
  },
  meta: {
    messages: {
      noSubject:
        'A unit test is named after the file it tests, but there is no {{subject}}.ts, .tsx, .js or .jsx beside this __tests__/ folder.',
      outsideTestsFolder: 'A unit test lives in a __tests__/ folder beside the file it tests.',
      specSuffix: 'Name a unit test *.test.*; *.spec.* is the suffix of the Playwright suite in testing/.'
    },
    schema: [],
    type: 'problem'
  }
};
