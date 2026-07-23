import ruleTester from '../../helpers/ruleTester.js';
import rule from '../no-exclusionary-terms.js';

ruleTester.run('aberlaas/no-exclusionary-terms', rule, {
  valid: [
    {
      name: 'Does not flag "listing" (no whitelist/blacklist substring)',
      code: 'const listing = [];',
    },
    {
      name: 'Does not flag "white" alone',
      code: 'const white = "#fff";',
    },
    {
      name: 'Does not flag "black" alone',
      code: 'const black = "#000";',
    },
    {
      name: 'Does not flag "listed" alone',
      code: 'const listed = true;',
    },
  ],
  invalid: [
    // whitelist identifiers
    {
      name: 'Flags "whitelist" and fixes to "allowlist"',
      code: 'const whitelist = [];',
      output: 'const allowlist = [];',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "Whitelist" and fixes to "Allowlist"',
      code: 'const Whitelist = [];',
      output: 'const Allowlist = [];',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "WHITELIST" and fixes to "ALLOWLIST"',
      code: 'const WHITELIST = [];',
      output: 'const ALLOWLIST = [];',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "whitelisted" and fixes to "allowlisted"',
      code: 'const whitelisted = true;',
      output: 'const allowlisted = true;',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "whitelistUsers" and fixes to "allowlistUsers"',
      code: 'const whitelistUsers = [];',
      output: 'const allowlistUsers = [];',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "addToWhitelist" and fixes to "addToAllowlist"',
      code: 'const addToWhitelist = null;',
      output: 'const addToAllowlist = null;',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },

    // blacklist identifiers
    {
      name: 'Flags "blacklist" and fixes to "blocklist"',
      code: 'const blacklist = [];',
      output: 'const blocklist = [];',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "BLACKLISTED" and fixes to "BLOCKLISTED"',
      code: 'const BLACKLISTED = true;',
      output: 'const BLOCKLISTED = true;',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags "addToBlacklist" and fixes to "addToBlocklist"',
      code: 'const addToBlacklist = null;',
      output: 'const addToBlocklist = null;',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },

    // identifier types
    {
      name: 'Flags function parameter names',
      code: 'function foo(whitelist) {}',
      output: 'function foo(allowlist) {}',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags object property keys',
      code: 'const obj = { blacklist: [] };',
      output: 'const obj = { blocklist: [] };',
      errors: [{ messageId: 'noExclusionaryTerm' }],
    },
    {
      name: 'Flags destructured names',
      code: 'const { whitelist } = obj;',
      output: 'const { allowlist } = obj;',
      errors: [
        { messageId: 'noExclusionaryTerm' },
        { messageId: 'noExclusionaryTerm' },
      ],
    },
  ],
});
