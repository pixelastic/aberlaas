/**
 * Abbreviation map. Each entry defines:
 * - type: "suffix" (preceded by lowercase) or "prefix" (followed by uppercase)
 * - abbreviated: the short form to match
 * - expanded: the replacement
 */
const abbreviations = [
  { type: 'suffix', abbreviated: 'Dir', expanded: 'Directory' },
  { type: 'prefix', abbreviated: 'abs', expanded: 'absolute' },
];

/**
 * Build a regex and replacement for a single abbreviation entry
 * @param {object} entry - Abbreviation map entry
 * @returns {object} { pattern, replace }
 */
function buildMatcher(entry) {
  if (entry.type === 'suffix') {
    return {
      pattern: new RegExp(`([a-z])${entry.abbreviated}([A-Z]|$)`),
      /**
       * @param {string} name - Identifier name
       * @returns {string} Expanded name
       */
      replace(name) {
        return name.replace(
          new RegExp(`([a-z])${entry.abbreviated}([A-Z]|$)`, 'g'),
          `$1${entry.expanded}$2`,
        );
      },
    };
  }

  return {
    pattern: new RegExp(`^${entry.abbreviated}([A-Z])`),
    /**
     * @param {string} name - Identifier name
     * @returns {string} Expanded name
     */
    replace(name) {
      return name.replace(
        new RegExp(`^${entry.abbreviated}([A-Z])`),
        `${entry.expanded}$1`,
      );
    },
  };
}

const matchers = abbreviations.map(buildMatcher);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow abbreviated names at camelCase boundaries',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAbbreviatedName: 'Use "{{expanded}}" instead of "{{original}}"',
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

        for (const matcher of matchers) {
          if (!matcher.pattern.test(original)) {
            continue;
          }

          const expanded = matcher.replace(original);
          context.report({
            node,
            messageId: 'noAbbreviatedName',
            data: { original, expanded },
            fix(fixer) {
              return fixer.replaceText(node, expanded);
            },
          });
          return;
        }
      },
    };
  },
};
