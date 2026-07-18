## TLDR

Register `private-methods-no-wrapper` in the ESLint config and run lint on the full codebase to verify it passes.

## What to build

Modify `modules/lint/configs/eslint/js.js`:

- Import `private-methods-no-wrapper` from `./rules/`.
- Add it to the `aberlaas` plugin `rules` object alongside `test-file-naming`.
- Enable it as `'error'` in the `rules` config section under the `// Aberlaas custom rules` comment.

Then run a full lint pass on the aberlaas codebase. Review each violation:

- Apply autofixes where available (same-name wrappers).
- Manually review warnings (different-name wrappers) and confirm the correct shorthand name.
- Verify the test suite still passes after fixes.

This is a HITL issue — the developer must review each fix.

## Acceptance criteria

- [ ] Rule imported in `js.js`
- [ ] Rule registered in the `aberlaas` plugin object
- [ ] Rule enabled as `['error']` in the rules config
- [ ] Existing `test-file-naming` registration unchanged
- [ ] Full lint pass runs clean with the new rule
- [ ] All autofixes applied and verified
- [ ] All warnings resolved manually
- [ ] Test suite passes after fixes
