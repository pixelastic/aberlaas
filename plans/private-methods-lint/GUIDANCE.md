## Guidance

- **Rule structure:** follow `modules/lint/configs/eslint/rules/test-file-naming.js` — ESM default export with `{ meta, create }`.
- **Test structure:** follow `modules/lint/configs/eslint/__tests__/test-file-naming.js` — `RuleTester` with vitest wiring (`RuleTester.describe = describe; RuleTester.it = it;`).
- **Registration:** in `modules/lint/configs/eslint/js.js`, import rule, add to `aberlaas` plugin `rules` object, enable as `['error']` in config.
- **Detection pattern:** all 3 rules trigger on `AssignmentExpression` where `left.name === '__'` and `right.type === 'ObjectExpression'`.
- **Test command:** `yarn run test modules/lint/configs/eslint/__tests__/<testfile>.js` from repo root.
- **Real-world example of correct `__` pattern:** see `lib/games/sync.js` in the emulation--sync-script worktree.

## Discoveries

### Issue 03b — register-no-rename
- Registration was already done as part of issue 03 — no separate registration step was needed
- Full lint pass produced zero violations for this rule in the codebase

### Issue 01 — no-wrapper
- Async arrows can have expression-body `await` (`async () => await fn()`), which is an `AwaitExpression` not a `CallExpression` — handle both in expression body detection
- `export default` is the correct pattern for ESLint rules in this repo (matches `test-file-naming.js`), despite `modules.md` preferring named exports
