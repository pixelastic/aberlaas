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

        // Must have at least one link after the root lodash call
        // (the root itself is not in links — it's `current`)
        if (_.isEmpty(links)) {
          return;
        }

        // _.chain() exclusion — already chaining
        const rootMethod = current.callee.property.name;
        if (rootMethod === 'chain') {
          return;
        }

        // Nesting guard: if root lodash call's first argument is
        // itself a _.xxx() call, skip (deferred to issue 02)
        if (
          !_.isEmpty(current.arguments) &&
          isLodashCall(current.arguments[0])
        ) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();

        // Build the fix: _.chain(collection).rootMethod(restArgs).links...value()
        const rootArgs = current.arguments;

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

        // Build chain links
        const chainSegments = links.map((link) => {
          const argsText = link.args
            .map((arg) => sourceCode.getText(arg))
            .join(', ');
          return `.${link.method}(${argsText})`;
        });

        const fixed = `_.chain(${collection})${rootSegment}${chainSegments.join('')}.value()`;

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
