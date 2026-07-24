## TLDR

Ban `Set` and `WeakSet` via `no-restricted-syntax` and refactor existing lint rule files that use them.

## What to build

Add six `no-restricted-syntax` selectors to the JS ESLint config (`modules/lint/configs/eslint/js.js`):
- `NewExpression[callee.name='Set']`
- `CallExpression[callee.name='Set']`
- `MemberExpression[object.name='Set']`
- `NewExpression[callee.name='WeakSet']`
- `CallExpression[callee.name='WeakSet']`
- `MemberExpression[object.name='WeakSet']`

Message for all six: `"Use arrays; use _.uniq() for deduplication"`.

Then refactor three existing lint rule files that use `new Set([...]).has(x)` to use `[...].includes(x)` instead:
- `modules/lint/configs/eslint/rules/js/private-methods-no-rename.js`
- `modules/lint/configs/eslint/rules/test/no-manual-mock-cleanup.js`
- `modules/lint/configs/eslint/rules/test/prefer-expect-to-have-property.js`

## Scaffolding Tests

Existing test suites for the three refactored rule files must still pass after replacing `Set` with arrays.

## Acceptance criteria

- [ ] `no-restricted-syntax` config added to `js.js` with all six selectors
- [ ] `private-methods-no-rename.js` no longer uses `Set`
- [ ] `no-manual-mock-cleanup.js` no longer uses `Set`
- [ ] `prefer-expect-to-have-property.js` no longer uses `Set`
- [ ] Existing tests for all three refactored rules pass
- [ ] Lint passes on the entire `modules/lint` directory
