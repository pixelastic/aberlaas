import { _ } from 'golgoth';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow wrapper functions in __ = { ... } that can be replaced with shorthand',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noWrapper: 'Use shorthand `{{ calleeName }},` instead',
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

        _.each(node.right.properties, (property) => {
          if (property.type !== 'Property' || property.shorthand) {
            return;
          }

          const callExpr = getWrappedCall(property.value);
          if (!callExpr) {
            return;
          }

          if (!argsMatchParams(property.value.params, callExpr.arguments)) {
            return;
          }

          const calleeName =
            callExpr.callee.type === 'Identifier' ? callExpr.callee.name : null;
          if (!calleeName) {
            return;
          }

          const keyName =
            property.key.type === 'Identifier' ? property.key.name : null;

          const report = {
            node: property,
            messageId: 'noWrapper',
            data: { calleeName },
          };

          if (keyName === calleeName) {
            report.fix = (fixer) => fixer.replaceText(property, calleeName);
          }

          context.report(report);
        });
      },
    };
  },
};

/**
 * Extract the single call expression from a wrapper function body.
 * Handles: arrow expression body, block body with single return,
 * and return await.
 * @param {object} fnNode - FunctionExpression or ArrowFunctionExpression
 * @returns {object|null} The CallExpression node, or null
 */
function getWrappedCall(fnNode) {
  if (
    !_.includes(['FunctionExpression', 'ArrowFunctionExpression'], fnNode.type)
  ) {
    return null;
  }

  const { body } = fnNode;

  // Arrow with expression body: (url) => fetch(url)
  if (body.type === 'CallExpression') {
    return body;
  }

  // Arrow with await expression body: async (url) => await fetch(url)
  if (
    _.isMatch(body, {
      type: 'AwaitExpression',
      argument: { type: 'CallExpression' },
    })
  ) {
    return body.argument;
  }

  // Block body with single return statement
  if (!_.isMatch(body, { type: 'BlockStatement' }) || body.body.length !== 1) {
    return null;
  }

  const stmt = body.body[0];
  if (!_.isMatch(stmt, { type: 'ReturnStatement' }) || !stmt.argument) {
    return null;
  }

  // return fetch(url)
  if (stmt.argument.type === 'CallExpression') {
    return stmt.argument;
  }

  // return await fetch(url)
  if (
    _.isMatch(stmt.argument, {
      type: 'AwaitExpression',
      argument: { type: 'CallExpression' },
    })
  ) {
    return stmt.argument.argument;
  }

  return null;
}

/**
 * Check if function params match call arguments exactly (same names, same order)
 * @param {object[]} params - Function parameter nodes
 * @param {object[]} args - Call argument nodes
 * @returns {boolean} True if params and args match
 */
function argsMatchParams(params, args) {
  if (params.length !== args.length) {
    return false;
  }

  return _.every(params, (param, index) => {
    const arg = args[index];
    return (
      _.isMatch(param, { type: 'Identifier', name: param.name }) &&
      _.isMatch(arg, { type: 'Identifier', name: param.name })
    );
  });
}
