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
    };
  },
};
