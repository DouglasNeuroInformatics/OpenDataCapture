import * as path from 'node:path';

const UNIT_TEST_FILENAME = /^(?<subject>.+)\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const EXTENSION = /\.[cm]?[jt]sx?$/u;

const WORKSPACE_SOURCE = /^(?<root>.*[/\\](?:apps|packages|runtime)[/\\][^/\\]+[/\\]src)[/\\]/u;

const MEMBER_PATH = /^(?:\.[\w$]+)*$/u;

const exportedName = (node) => (node.type === 'Identifier' ? node.name : String(node.value));

const isDescribe = (callee) => {
  if (callee.type === 'MemberExpression') {
    return isDescribe(callee.object);
  }
  if (callee.type === 'CallExpression') {
    return isDescribe(callee.callee);
  }
  return callee.type === 'Identifier' && callee.name === 'describe';
};

const dynamicallyImportedNames = (node) => {
  const result = node.parent?.type === 'AwaitExpression' ? node.parent : node;
  const consumer = result.parent;
  if (
    consumer?.type === 'MemberExpression' &&
    consumer.object === result &&
    !consumer.computed &&
    consumer.property.type === 'Identifier'
  ) {
    return [{ imported: consumer.property.name }];
  }
  if (consumer?.type !== 'VariableDeclarator' || consumer.id.type !== 'ObjectPattern') {
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

/** @type {import('eslint').Rule.RuleModule} */
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
    const titles = new Set();
    const bindings = new Set();
    const subjectImports = [];
    let importsModule = false;

    const resolveImport = (specifier) => {
      if (specifier.startsWith('@/') && sourceRoot) {
        return path.join(sourceRoot, specifier.slice(2));
      }
      return specifier.startsWith('.') ? path.resolve(directory, specifier) : undefined;
    };

    const isSubject = (specifier) => {
      const resolved = typeof specifier === 'string' ? resolveImport(specifier) : undefined;
      if (resolved === undefined) {
        return false;
      }
      return resolved.replace(EXTENSION, '') === subjectPath || (subject === 'index' && resolved === subjectDirectory);
    };

    const addName = (imported, local) => {
      if (imported !== undefined && imported !== 'default') {
        titles.add(imported);
      }
      if (local !== undefined) {
        titles.add(local);
        bindings.add(local);
      }
    };

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
        if (node.source.type !== 'Literal' || !isSubject(node.source.value)) {
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
