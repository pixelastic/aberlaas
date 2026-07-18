## Guidance

- **Rule structure:** follow `modules/lint/configs/eslint/rules/test-file-naming.js` — ESM default export with `{ meta, create }`.
- **Test structure:** follow `modules/lint/configs/eslint/__tests__/test-file-naming.js` — `RuleTester` with vitest wiring (`RuleTester.describe = describe; RuleTester.it = it;`).
- **Registration:** in `modules/lint/configs/eslint/js.js`, import rule, add to `aberlaas` plugin `rules` object, enable as `['error']` in config.
- **Detection pattern:** all 3 rules trigger on `AssignmentExpression` where `left.name === '__'` and `right.type === 'ObjectExpression'`.
- **Test command:** `yarn vitest run modules/lint/configs/eslint/__tests__/` from repo root.
- **Real-world example of correct `__` pattern:** see `lib/games/sync.js` in the emulation--sync-script worktree.

## Discoveries
