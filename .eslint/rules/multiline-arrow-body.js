const LITERAL_BODY_TYPES = new Set([
  'ArrayExpression',
  'JSXElement',
  'JSXFragment',
  'ObjectExpression',
  'TemplateLiteral'
]);

/** @type {import('eslint').Rule.RuleModule} */
export const multilineArrowBody = {
  create(context) {
    const { sourceCode } = context;
    return {
      ArrowFunctionExpression(node) {
        const { body } = node;
        if (body.type === 'BlockStatement' || LITERAL_BODY_TYPES.has(body.type)) {
          return;
        }
        const arrow = sourceCode.getTokenBefore(body, (token) => token.value === '=>');
        if (arrow?.loc.end.line === body.loc.end.line) {
          return;
        }
        let [start, end] = body.range;
        let before = sourceCode.getTokenBefore(body);
        let after = sourceCode.getTokenAfter(body);
        while (before?.value === '(' && after?.value === ')') {
          [start, end] = [before.range[0], after.range[1]];
          before = sourceCode.getTokenBefore(before);
          after = sourceCode.getTokenAfter(after);
        }
        context.report({
          fix: (fixer) => fixer.replaceTextRange([start, end], `{ return ${sourceCode.getText(body)}; }`),
          messageId: 'block',
          node: body
        });
      }
    };
  },
  meta: {
    fixable: 'code',
    messages: { block: 'An arrow body that ends below the `=>` line is a literal, or a block with `return`.' },
    schema: [],
    type: 'suggestion'
  }
};
