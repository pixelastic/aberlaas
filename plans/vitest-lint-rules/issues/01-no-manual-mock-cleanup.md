## TLDR

Custom ESLint rule that errors on redundant vi.restoreAllMocks/clearAllMocks/resetAllMocks calls with config-specific messages.

## What to build

Create a custom ESLint rule `aberlaas/no-manual-mock-cleanup` that detects calls to `vi.restoreAllMocks()`, `vi.clearAllMocks()`, and `vi.resetAllMocks()`. Each method gets a distinct error message referencing the vitest config option that makes it redundant. No autofix — the message is educational.

The rule visits `CallExpression` nodes. It matches when the callee is a `MemberExpression` with `object.name === 'vi'` and `property.name` in `{restoreAllMocks, clearAllMocks, resetAllMocks}`.

Messages:
- restoreAllMocks: "No need to manually restore mocks, vitest is already configured with restoreMocks: true"
- clearAllMocks: "No need to manually clear mocks, vitest is already configured with clearMocks: true"
- resetAllMocks: "No need to manually reset mocks, vitest is already configured with restoreMocks: true"

Register the rule in the `aberlaas` plugin (in `js.js`). Activate it in `vitest.js` as `['error']`.

Prior art: `modules/lint/configs/eslint/rules/test-file-naming.js` for rule structure, `modules/lint/configs/eslint/__tests__/test-file-naming.js` for test structure.

## Behavioral Tests

**Reports error on banned vi methods**
- should report restoreAllMocks with restoreMocks message
- should report clearAllMocks with clearMocks message
- should report resetAllMocks with restoreMocks message

**Allows legitimate vi calls**
- should allow vi.spyOn
- should allow vi.fn
- should allow vi.mock
- should allow restoreAllMocks on objects other than vi

## Acceptance criteria

- [ ] Rule file created at `modules/lint/configs/eslint/rules/no-manual-mock-cleanup.js`
- [ ] Rule registered in `aberlaas` plugin in `modules/lint/configs/eslint/js.js`
- [ ] Rule activated as `['error']` in `modules/lint/configs/eslint/vitest.js`
- [ ] Test file created at `modules/lint/configs/eslint/__tests__/no-manual-mock-cleanup.js`
- [ ] All tests pass
- [ ] Lint passes on the codebase
