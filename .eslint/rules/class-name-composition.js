const CLASS_NAME = 'className';

const isCallerClassName = (node) => {
  if (node.type === 'Identifier') {
    return node.name === CLASS_NAME;
  }
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    node.object.type === 'Identifier' &&
    node.object.name === 'props' &&
    node.property.name === CLASS_NAME
  );
};

/** @type {import('eslint').Rule.RuleModule} */
export const classNameComposition = {
  create(context) {
    return {
      CallExpression(node) {
        const { arguments: args, callee } = node;
        if (callee.type !== 'Identifier' || callee.name !== 'cn') {
          return;
        }
        for (const argument of args.slice(0, -1).filter(isCallerClassName)) {
          context.report({ messageId: 'last', node: argument });
        }
      },
      JSXAttribute(node) {
        const { name, value } = node;
        if (name.type !== 'JSXIdentifier' || name.name !== CLASS_NAME || value?.type !== 'JSXExpressionContainer') {
          return;
        }
        const { expression } = value;
        const isConcatenation = expression.type === 'BinaryExpression' && expression.operator === '+';
        if (expression.type === 'TemplateLiteral' || isConcatenation) {
          context.report({ messageId: 'compose', node: expression });
        }
      }
    };
  },
  meta: {
    messages: {
      compose: 'Compose class names with `cn()`, not a template literal or `+`, so conflicting Tailwind classes merge.',
      last: "Pass `className` last to `cn()`, so the caller's classes win."
    },
    schema: [],
    type: 'suggestion'
  }
};
