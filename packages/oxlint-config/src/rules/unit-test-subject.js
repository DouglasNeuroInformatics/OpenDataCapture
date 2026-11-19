/** @import { CreateRule, ESTree } from '@oxlint/plugins' */

import * as path from 'node:path';

const UNIT_TEST_FILENAME = /^(?<subject>.+)\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const EXTENSION = /\.[cm]?[jt]sx?$/u;

const WORKSPACE_SOURCE = /^(?<root>.*[/\\](?:apps|packages|runtime)[/\\][^/\\]+[/\\]src)[/\\]/u;

const MEMBER_PATH = /^(?:\.[\w$]+)*$/u;

/** @type {(node: ESTree.ModuleExportName | Extract<ESTree.Expression, { type: 'Literal' }>) => string} */
const exportedName = (node) => (node.type === 'Identifier' ? node.name : String(node.value));

/** @type {(callee: ESTree.Expression) => boolean} */
const isDescribe = (callee) => {
  if (callee.type === 'MemberExpression') {
    return isDescribe(callee.object);
  }
  if (callee.type === 'CallExpression') {
    return isDescribe(callee.callee);
  }
  return callee.type === 'Identifier' && callee.name === 'describe';
};

/** @type {(node: ESTree.ImportExpression) => Array<{ imported: string; local?: string }>} */
const dynamicallyImportedNames = (node) => {
  const result = node.parent.type === 'AwaitExpression' ? node.parent : node;
  const consumer = result.parent;
  if (
    consumer.type === 'MemberExpression' &&
    consumer.object === result &&
    consumer.property.type === 'Identifier' &&
    'computed' in consumer &&
    !consumer.computed
  ) {
    return [{ imported: consumer.property.name }];
  }
  if (consumer.type !== 'VariableDeclarator' || consumer.id.type !== 'ObjectPattern') {
    return [];
  }
  return consumer.id.properties.flatMap((property) => {
    if (
      property.type !== 'Property' ||
      property.computed ||
      (property.key.type !== 'Identifier' && property.key.type !== 'Literal')
    ) {
      return [];
    }
    const local = property.value.type === 'Identifier' ? property.value.name : undefined;
    return [{ imported: exportedName(property.key), local }];
  });
};

/** @type {CreateRule} */
export const unitTestSubject = {
  create(context) {
    const directory = path.dirname(context.filename);
    const subject = UNIT_TEST_FILENAME.exec(path.basename(context.filename))?.groups?.subject;
    if (subject === undefined || path.basename(directory) !== '__tests__') {
      return {};
    }
    const sourceRoot = WORKSPACE_SOURCE.exec(context.filename)?.groups?.root;
    const subjectDirectory = path.dirname(directory);
    const subjectPath = path.join(subjectDirectory, subject);
    /** @type {Set<string>} */
    const titles = new Set();
    /** @type {Set<string>} */
    const bindings = new Set();
    /** @type {Array<ESTree.ImportDeclaration | ESTree.ImportExpression>} */
    const subjectImports = [];
    let importsModule = false;

    /** @type {(specifier: string) => string | undefined} */
    const resolveImport = (specifier) => {
      if (specifier.startsWith('@/') && sourceRoot) {
        return path.join(sourceRoot, specifier.slice(2));
      }
      return specifier.startsWith('.') ? path.resolve(directory, specifier) : undefined;
    };

    /** @type {(specifier: string) => boolean} */
    const isSubject = (specifier) => {
      const resolved = resolveImport(specifier);
      if (resolved === undefined) {
        return false;
      }
      return resolved.replace(EXTENSION, '') === subjectPath || (subject === 'index' && resolved === subjectDirectory);
    };

    /** @type {(imported: string | undefined, local: string | undefined) => void} */
    const addName = (imported, local) => {
      if (imported !== undefined && imported !== 'default') {
        titles.add(imported);
      }
      if (local !== undefined) {
        titles.add(local);
        bindings.add(local);
      }
    };

    /** @type {(value: string) => boolean} */
    const isTitle = (value) => {
      const names = importsModule ? [...titles, subject] : [...titles];
      return names.some((name) => value.startsWith(name) && MEMBER_PATH.test(value.slice(name.length)));
    };

    return {
      ImportDeclaration(node) {
        if (!isSubject(node.source.value)) {
          return;
        }
        subjectImports.push(node);
        if (node.specifiers.length === 0 || node.specifiers.some(({ type }) => type === 'ImportNamespaceSpecifier')) {
          importsModule = true;
        }
        for (const specifier of node.specifiers) {
          addName(
            specifier.type === 'ImportSpecifier' ? exportedName(specifier.imported) : undefined,
            specifier.local.name
          );
        }
      },
      ImportExpression(node) {
        if (node.source.type !== 'Literal' || typeof node.source.value !== 'string' || !isSubject(node.source.value)) {
          return;
        }
        subjectImports.push(node);
        const names = dynamicallyImportedNames(node);
        if (names.length === 0) {
          importsModule = true;
        }
        for (const { imported, local } of names) {
          addName(imported, local);
        }
      },
      'Program:exit'(program) {
        if (subjectImports.length === 0) {
          context.report({ data: { subject }, loc: { column: 0, line: 1 }, messageId: 'import' });
          return;
        }
        for (const statement of program.body) {
          const call = statement.type === 'ExpressionStatement' ? statement.expression : undefined;
          if (call?.type !== 'CallExpression' || !isDescribe(call.callee)) {
            continue;
          }
          const [title] = call.arguments;
          const isNamed =
            (title?.type === 'Literal' && typeof title.value === 'string' && isTitle(title.value)) ||
            (title?.type === 'Identifier' && bindings.has(title.name));
          if (!isNamed) {
            context.report({ data: { subject }, messageId: 'describe', node: title ?? call });
          }
        }
      }
    };
  },
  meta: {
    messages: {
      describe:
        'Title each top-level `describe` after a name this test imports from `{{subject}}`, or after `{{subject}}` when it imports the module itself, optionally followed by `.member`.',
      import: 'A unit test imports the file it tests, `{{subject}}`.'
    },
    schema: [],
    type: 'suggestion'
  }
};
