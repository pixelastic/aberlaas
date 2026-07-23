import { _ } from 'golgoth';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `_.chain()` over post-chain method calls on lodash results',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferChain:
        'Use `_.chain()` instead of calling methods on a lodash result',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    /**
     * Check if a node is a _.xxx() call
     * @param {import('estree').Node} node - AST node
     * @returns {boolean} True if node is a lodash call
     */
    function isLodashCall(node) {
      if (node.type !== 'CallExpression') {
        return false;
      }
      const { callee } = node;
      return (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.object.type === 'Identifier' &&
        callee.object.name === '_'
      );
    }

    return {
      CallExpression(node) {
        const { callee } = node;

        // Must be a method call: something.method(args)
        if (callee.type !== 'MemberExpression' || callee.computed) {
          return;
        }

        // Inner-nesting guard: skip if this call is the first argument
        // of another lodash call (the outer call handles the full chain)
        if (
          node.parent &&
          node.parent.type === 'CallExpression' &&
          isLodashCall(node.parent) &&
          node.parent.arguments[0] === node
        ) {
          return;
        }

        // Top-of-chain guard: skip if this node's result is used
        // as the object of another method call
        const { parent } = node;
        if (
          parent &&
          parent.type === 'MemberExpression' &&
          parent.parent &&
          parent.parent.type === 'CallExpression' &&
          parent.parent.callee === parent
        ) {
          return;
        }

        // Walk down the chain collecting links
        // Each link is { method, args, node }
        const links = [];
        let current = node;

        while (
          current.type === 'CallExpression' &&
          current.callee.type === 'MemberExpression' &&
          !current.callee.computed
        ) {
          // If this is a _.xxx() call, it's the root — stop
          if (isLodashCall(current)) {
            break;
          }
          const methodName = current.callee.property.name;
          links.unshift({ method: methodName, args: current.arguments });
          current = current.callee.object;
        }

        // The root must be a _.xxx() call
        if (!isLodashCall(current)) {
          return;
        }

        // _.chain() exclusion — already chaining
        if (isLodashCall(current) && current.callee.property.name === 'chain') {
          return;
        }

        // Unwrap nested lodash calls from root's first argument
        const nestedMethods = [];
        let innermost = current;
        while (
          !_.isEmpty(innermost.arguments) &&
          isLodashCall(innermost.arguments[0])
        ) {
          nestedMethods.unshift({
            method: innermost.callee.property.name,
            args: innermost.arguments.slice(1),
          });
          innermost = innermost.arguments[0];
        }

        // Must have at least one post-chain link or nested method
        if (_.isEmpty(links) && _.isEmpty(nestedMethods)) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();

        // Build fix from innermost lodash call outward
        const rootMethod = innermost.callee.property.name;
        const rootArgs = innermost.arguments;

        const collection = !_.isEmpty(rootArgs)
          ? sourceCode.getText(rootArgs[0])
          : '';
        const restArgs = rootArgs.slice(1);

        // Build root method segment
        const restArgsText = !_.isEmpty(restArgs)
          ? restArgs.map((arg) => sourceCode.getText(arg)).join(', ')
          : '';
        const rootSegment = !_.isEmpty(restArgsText)
          ? `.${rootMethod}(${restArgsText})`
          : `.${rootMethod}()`;

        // Build nested method segments (inner to outer)
        const nestedSegments = nestedMethods.map((nested) => {
          const argsText = nested.args
            .map((arg) => sourceCode.getText(arg))
            .join(', ');
          return `.${nested.method}(${argsText})`;
        });

        // Build post-chain link segments
        const chainSegments = links.map((link) => {
          const argsText = link.args
            .map((arg) => sourceCode.getText(arg))
            .join(', ');
          return `.${link.method}(${argsText})`;
        });

        const fixed = `_.chain(${collection})${rootSegment}${nestedSegments.join('')}${chainSegments.join('')}.value()`;

        context.report({
          node,
          messageId: 'preferChain',
          fix(fixer) {
            return fixer.replaceText(node, fixed);
          },
        });
      },
    };
  },
};
