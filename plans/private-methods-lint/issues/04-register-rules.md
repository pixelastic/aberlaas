## TLDR

Import and register the 3 new rules in the aberlaas ESLint plugin config.

## What to build

Modify `modules/lint/configs/eslint/js.js`:

- Import `private-methods-no-wrapper`, `private-methods-ordering`, and `private-methods-no-rename` from `./rules/`.
- Add all three to the `aberlaas` plugin `rules` object alongside `test-file-naming`.
- Enable all three as `'error'` in the `rules` config section under the `// Aberlaas custom rules` comment.

## Acceptance criteria

- [ ] All 3 rules imported in `js.js`
- [ ] All 3 rules registered in the `aberlaas` plugin object
- [ ] All 3 rules enabled as `['error']` in the rules config
- [ ] Existing `test-file-naming` registration unchanged
