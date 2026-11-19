/** @import { CreateRule, Definition, ESTree, Scope, Variable } from '@oxlint/plugins' */

const EVENT_PROP = /^on[A-Z]/u;

const HANDLER_NAME = /^handle[A-Z]/u;

const SETTER_NAME = /^set[A-Z]/u;

const FUNCTION_EXPRESSIONS = new Set(['ArrowFunctionExpression', 'FunctionExpression']);

/** @type {(callee: ESTree.Expression) => boolean} */
const isUseCallback = (callee) => {
  const identifier = callee.type === 'MemberExpression' ? callee.property : callee;
  const isNamed = identifier.type === 'Identifier' || identifier.type === 'PrivateIdentifier';
  return isNamed && identifier.name === 'useCallback';
};

/** @type {(definition: Definition) => boolean} */
const isFunctionWrittenInFile = ({ node, type }) => {
  if (type === 'FunctionName') {
    return true;
  }
  if (type !== 'Variable' || node.type !== 'VariableDeclarator' || node.id.type !== 'Identifier' || !node.init) {
    return false;
  }
  const { init } = node;
  return FUNCTION_EXPRESSIONS.has(init.type) || (init.type === 'CallExpression' && isUseCallback(init.callee));
};

/** @type {(scope: null | Scope, name: string) => undefined | Variable} */
const findVariable = (scope, name) => {
  if (!scope) {
    return undefined;
  }
  return scope.set.get(name) ?? findVariable(scope.upper, name);
};

/** @type {CreateRule} */
export const handlerNames = {
  create(context) {
    return {
      JSXAttribute(attribute) {
        const { name, value } = attribute;
        if (name.type !== 'JSXIdentifier' || !EVENT_PROP.test(name.name)) {
          return;
        }
        if (value?.type !== 'JSXExpressionContainer' || value.expression.type !== 'Identifier') {
          return;
        }
        const handler = value.expression.name;
        if (HANDLER_NAME.test(handler) || SETTER_NAME.test(handler)) {
          return;
        }
        const [definition] = findVariable(context.sourceCode.getScope(value.expression), handler)?.defs ?? [];
        if (definition && isFunctionWrittenInFile(definition)) {
          context.report({ data: { handler, prop: name.name }, messageId: 'handler', node: value.expression });
        }
      }
    };
  },
  meta: {
    messages: { handler: 'Name the local function passed to `{{prop}}` `handle…`, not `{{handler}}`.' },
    schema: [],
    type: 'suggestion'
  }
};
