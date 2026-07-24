import { _ } from 'golgoth';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow JSDoc comments on shorthand proxies in __ = { ... }',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noJsdocOnProxy: 'Shorthand proxies do not require documentation',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      AssignmentExpression(node) {
        if (
          !_.isMatch(node, {
            left: { type: 'Identifier', name: '__' },
            right: { type: 'ObjectExpression' },
          })
        ) {
          return;
        }

        _.each(node.right.properties, (property) => {
          if (property.type !== 'Property' || !property.shorthand) {
            return;
          }

          const comments = sourceCode.getCommentsBefore(property);
          _.each(comments, (comment) => {
            if (!isJsdocWithTag(comment)) {
              return;
            }

            context.report({
              node: property,
              messageId: 'noJsdocOnProxy',
              fix(fixer) {
                const text = sourceCode.getText();
                const start = comment.range[0];
                const end = comment.range[1];
                // Remove trailing whitespace/newline after comment
                let removeEnd = end;
                while (
                  removeEnd < text.length &&
                  (text[removeEnd] === ' ' || text[removeEnd] === '\n')
                ) {
                  removeEnd++;
                }
                return fixer.removeRange([start, removeEnd]);
              },
            });
          });
        });
      },
    };
  },
};

/**
 * Check if a comment is a JSDoc block containing at least one @tag at line start
 * @param {object} comment - ESLint comment token
 * @returns {boolean} True if JSDoc with @tag
 */
function isJsdocWithTag(comment) {
  if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
    return false;
  }

  return /^\s*\*\s+@\w+/m.test(comment.value);
}
