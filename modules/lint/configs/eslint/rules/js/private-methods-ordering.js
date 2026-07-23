import { _ } from 'golgoth';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce shorthand properties come after non-shorthand in __ = { ... }',
    },
    fixable: 'code',
    schema: [],
    messages: {
      ordering:
        'Shorthand properties must come after non-shorthand properties in __',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
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

        const properties = node.right.properties;

        // Check if any shorthand appears before a non-shorthand
        const firstNonShorthandAfterShorthand = _.some(
          properties,
          (prop, index) => {
            if (prop.shorthand) {
              return false;
            }
            return _.some(properties.slice(0, index), (prev) => prev.shorthand);
          },
        );

        if (!firstNonShorthandAfterShorthand) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();

        context.report({
          node: node.right,
          messageId: 'ordering',
          fix(fixer) {
            const nonShorthands = _.filter(properties, (p) => !p.shorthand);
            const shorthands = _.filter(properties, (p) => p.shorthand);

            const reordered = [...nonShorthands, ...shorthands];

            // Start of a property, including its leading comments (JSDoc)
            const fullText = sourceCode.getText();
            const propStart = (p) => {
              const comments = sourceCode.getCommentsBefore(p);
              return comments.length ? comments[0].range[0] : p.range[0];
            };
            // Keep leading comments attached when moving each property
            const getTextWithComments = (p) =>
              fullText.slice(propStart(p), p.range[1]);

            // Derive separator from original code (e.g. ",\n  " or ", ")
            const separator = fullText.slice(
              properties[0].range[1],
              propStart(properties[1]),
            );
            const newText = _.chain(reordered)
              .map(getTextWithComments)
              .join(separator)
              .value();

            return fixer.replaceTextRange(
              [
                propStart(properties[0]),
                properties[properties.length - 1].range[1],
              ],
              newText,
            );
          },
        });
      },
    };
  },
};
