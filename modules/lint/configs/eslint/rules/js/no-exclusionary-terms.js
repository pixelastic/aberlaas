/* eslint-disable aberlaas/no-exclusionary-terms */
import { _ } from 'golgoth';

/**
 * Term map: exclusionary term → inclusive replacement (lowercase).
 */
const terms = {
  whitelist: 'allowlist',
  blacklist: 'blocklist',
};

const termKeys = _.keys(terms);

/**
 * Replace a matched term preserving case variant.
 * Handles: lowercase, Title case, UPPER CASE.
 * @param {string} match - The matched substring
 * @param {string} replacement - The lowercase replacement
 * @returns {string} Case-preserved replacement
 */
function replacePreservingCase(match, replacement) {
  // ALL CAPS
  if (
    match[0] === match[0].toUpperCase() &&
    match[1] === match[1].toUpperCase()
  ) {
    return replacement.toUpperCase();
  }
  // Title case
  if (match[0] === match[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  // lowercase
  return replacement;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow exclusionary terms (whitelist/blacklist) in identifiers',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noExclusionaryTerm: 'Use "{{fixed}}" instead of "{{original}}"',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      /**
       * @param {import('estree').Identifier} node - AST Identifier node
       */
      Identifier(node) {
        const original = node.name;
        const lower = original.toLowerCase();

        for (const term of termKeys) {
          const index = lower.indexOf(term);
          if (index === -1) {
            continue;
          }

          const matchedPart = original.slice(index, index + term.length);
          const replacement = replacePreservingCase(matchedPart, terms[term]);
          const fixed =
            original.slice(0, index) +
            replacement +
            original.slice(index + term.length);

          context.report({
            node,
            messageId: 'noExclusionaryTerm',
            data: { original, fixed },
            fix(fixer) {
              return fixer.replaceText(node, fixed);
            },
          });
          return;
        }
      },

      /**
       * Scan all comments for exclusionary terms.
       */
      Program() {
        const comments = context.sourceCode.getAllComments();

        _.each(comments, (comment) => {
          const text = comment.value;
          const lower = text.toLowerCase();

          _.each(termKeys, (term) => {
            const index = lower.indexOf(term);
            if (index === -1) {
              return;
            }

            const matchedPart = text.slice(index, index + term.length);
            const replacement = replacePreservingCase(matchedPart, terms[term]);
            const fixed =
              text.slice(0, index) +
              replacement +
              text.slice(index + term.length);

            // Both // and /* prefixes are 2 chars; */ suffix is 2 chars
            const rangeStart = comment.range[0] + 2;
            const rangeEnd =
              comment.range[1] - (comment.type === 'Block' ? 2 : 0);

            context.report({
              loc: comment.loc,
              messageId: 'noExclusionaryTerm',
              data: { original: matchedPart, fixed: replacement },
              fix(fixer) {
                return fixer.replaceTextRange([rangeStart, rangeEnd], fixed);
              },
            });
          });
        });
      },
    };
  },
};
