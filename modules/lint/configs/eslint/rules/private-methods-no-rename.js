import { _ } from 'golgoth';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow renamed identifier references in __ = { ... }',
    },
    schema: [],
    messages: {
      noRename: 'Use shorthand `{{ valueName }},` instead',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    const globalIdentifiers = new Set(['undefined', 'NaN', 'Infinity']);

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
          if (
            property.type !== 'Property' ||
            property.shorthand ||
            property.computed
          ) {
            return;
          }

          if (
            property.key.type !== 'Identifier' ||
            property.value.type !== 'Identifier'
          ) {
            return;
          }

          if (property.key.name === property.value.name) {
            return;
          }

          if (globalIdentifiers.has(property.value.name)) {
            return;
          }

          context.report({
            node: property,
            messageId: 'noRename',
            data: { valueName: property.value.name },
          });
        });
      },
    };
  },
};
