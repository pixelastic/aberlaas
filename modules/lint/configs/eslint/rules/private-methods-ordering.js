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
            const newText = _.map(reordered, (p) => sourceCode.getText(p)).join(
              ', ',
            );

            return fixer.replaceTextRange(
              [
                properties[0].range[0],
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
