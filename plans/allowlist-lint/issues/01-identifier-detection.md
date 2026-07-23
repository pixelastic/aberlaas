## TLDR

Create the `no-exclusionary-terms` rule with identifier detection, case-preserving fix, registration in `js.js`, and tests.

## What to build

Create a new ESLint rule `no-exclusionary-terms` that detects `whitelist` and `blacklist` as case-insensitive substrings in identifiers, and auto-fixes them to `allowlist`/`blocklist` with case preservation.

The rule file goes in `modules/lint/configs/eslint/rules/no-exclusionary-terms.js`. Follow the structure of `no-abbreviated-names.js`: export default with `meta` (`type: 'suggestion'`, `fixable: 'code'`, `schema: []`, single `messageId`) and `create` returning an `Identifier` visitor.

The term map has two entries: `whitelist→allowlist`, `blacklist→blocklist`. Matching is case-insensitive substring. Replacement preserves 3 case variants: lowercase, title-case (first char upper, second lower), all-caps (first two chars upper).

Register the rule in `modules/lint/configs/eslint/js.js`: import at top, add to `aberlaas` plugin `rules` object, enable as `['error']` in the rules config section.

## Behavioral Tests

Test file: `modules/lint/configs/eslint/__tests__/no-exclusionary-terms.js`

**Valid (no error):**
- Does not flag `listing` (no `whitelist`/`blacklist` substring)
- Does not flag `white` alone
- Does not flag `black` alone
- Does not flag `listed` alone

**Invalid — whitelist identifiers:**
- Flags `whitelist` and fixes to `allowlist`
- Flags `Whitelist` and fixes to `Allowlist`
- Flags `WHITELIST` and fixes to `ALLOWLIST`
- Flags `whitelisted` and fixes to `allowlisted`
- Flags `whitelistUsers` and fixes to `allowlistUsers`
- Flags `addToWhitelist` and fixes to `addToAllowlist`

**Invalid — blacklist identifiers:**
- Flags `blacklist` and fixes to `blocklist`
- Flags `BLACKLISTED` and fixes to `BLOCKLISTED`
- Flags `addToBlacklist` and fixes to `addToBlocklist`

**Invalid — identifier types:**
- Flags function parameter names
- Flags object property keys
- Flags destructured names

## Acceptance criteria

- [ ] Rule file created following `no-abbreviated-names.js` structure
- [ ] Catches `whitelist` and `blacklist` case-insensitively in identifiers
- [ ] Catches compound forms (`whitelisted`, `blacklisting`, `addToWhitelist`)
- [ ] Auto-fix preserves case (lower, title, ALL-CAPS)
- [ ] Rule registered and enabled at `error` in `js.js`
- [ ] All behavioral tests pass
