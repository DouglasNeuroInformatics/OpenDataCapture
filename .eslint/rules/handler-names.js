const EVENT_PROP = /^on[A-Z]/u;

const HANDLER_NAME = /^handle[A-Z]/u;

const SETTER_NAME = /^set[A-Z]/u;

const FUNCTION_EXPRESSIONS = new Set(['ArrowFunctionExpression', 'FunctionExpression']);

const isUseCallback = (callee) => {
  const name = callee.type === 'MemberExpression' ? callee.property.name : callee.name;
  return name === 'useCallback';
};

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

const findVariable = (scope, name) => {
  if (!scope) {
    return undefined;
  }
  return scope.set.get(name) ?? findVariable(scope.upper, name);
};

/** @type {import('eslint').Rule.RuleModule} */
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
