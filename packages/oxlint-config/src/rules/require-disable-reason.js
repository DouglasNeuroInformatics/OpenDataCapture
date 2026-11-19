/** @import { CreateRule } from '@oxlint/plugins' */

// ESLint and oxlint split a directive comment from its description at this separator
const DESCRIPTION_SEPARATOR = /\s-{2,}\s/u;

const DISABLE_DIRECTIVE = /^\s*(?:eslint|oxlint)-disable(?:-line|-next-line)?(?:\s|$)/u;

/** @type {(comment: string) => string} */
const descriptionOf = (comment) => {
  const separator = DESCRIPTION_SEPARATOR.exec(comment);
  return separator ? comment.slice(separator.index + separator[0].length).trim() : '';
};

/** @type {CreateRule} */
export const requireDisableReason = {
  create(context) {
    return {
      Program() {
        for (const { loc, value } of context.sourceCode.getAllComments()) {
          if (DISABLE_DIRECTIVE.test(value) && !descriptionOf(value)) {
            context.report({ loc, messageId: 'reason' });
          }
        }
      }
    };
  },
  meta: {
    messages: { reason: 'State why the rule is disabled: `// eslint-disable-next-line <rule> -- <reason>`.' },
    schema: [],
    type: 'suggestion'
  }
};
