## TLDR

Register `private-methods-no-rename` in the ESLint config and run lint on the full codebase to verify it passes.

## What to build

Modify `modules/lint/configs/eslint/js.js`:

- Import `private-methods-no-rename` from `./rules/`.
- Add it to the `aberlaas` plugin `rules` object.
- Enable it as `'error'` in the `rules` config section under the `// Aberlaas custom rules` comment.

Then run a full lint pass on the aberlaas codebase. Review each violation:

- Manually review each warning (no autofix for this rule) and confirm the correct name.
- Verify the test suite still passes after fixes.

This is a HITL issue — the developer must review each fix.

## Acceptance criteria

- [ ] Rule imported in `js.js`
- [ ] Rule registered in the `aberlaas` plugin object
- [ ] Rule enabled as `['error']` in the rules config
- [ ] Full lint pass runs clean with the new rule
- [ ] All warnings resolved manually
- [ ] Test suite passes after fixes
