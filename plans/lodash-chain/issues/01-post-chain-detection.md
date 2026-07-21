## TLDR

Create `prefer-lodash-chain` rule detecting `_.xxx(...).method(...)` post-chain pattern with auto-fix.

## What to build

Create a new ESLint rule `prefer-lodash-chain` that detects when a lodash call
result is followed by a method call, and auto-fixes to `_.chain()` form.

The rule file goes in `configs/eslint/rules/prefer-lodash-chain.js`, following
the same structure as existing `prefer-lodash-*` rules (meta + create visitor).

Core logic:
- Helper `isLodashCall(node)` — identifies `_.xxx()` CallExpression nodes
  (non-computed MemberExpression, object is `_` Identifier)
- Top-of-chain guard — skip nodes whose result is the object of another method
  call, to avoid duplicate reports on intermediate chain nodes
- Chain walker — from top of chain, walk down `callee.object` collecting method
  names and args until hitting a `_.xxx()` root
- `_.chain()` exclusion — if the root is `_.chain()`, skip (already chaining)
- **Nesting guard** — if the root lodash call's first argument is itself a
  `_.xxx()` call, skip reporting (combined case deferred to issue 02)
- Fix builder — reconstruct as `_.chain(collection).method(args)...value()`

Register the rule in `configs/eslint/js.js`: import, add to
`plugins.aberlaas.rules`, enable as `aberlaas/prefer-lodash-chain: ['error']`.

Test file goes in `configs/eslint/__tests__/prefer-lodash-chain.js` using
`RuleTester` wired to vitest, same pattern as existing tests.

## Behavioral Tests

**Valid cases (should not flag):**
- Accepts `_.map(arr, fn)` — single lodash call, no chain after
- Accepts `_.chain(arr).map(fn).value()` — already using chain
- Accepts `arr.map(fn).join(sep)` — not a lodash call
- Accepts `_.isEmpty(x)` — single lodash call, no chain
- Does not flag `_.map(arr, fn).length` — property access, not method call
- Does not flag `_.map(_.filter(arr, pred), fn).join(sep)` — nesting guard defers to issue 02

**Invalid cases (should flag + verify fix output):**
- Flags `_.map(arr, fn).join(sep)` → `_.chain(arr).map(fn).join(sep).value()`
- Flags `_.filter(arr, pred).map(fn)` → `_.chain(arr).filter(pred).map(fn).value()`
- Flags `_.map(arr, fn).filter(pred).join(sep)` → `_.chain(arr).map(fn).filter(pred).join(sep).value()`
- Flags `_.uniqueId().padStart(5, '0')` → `_.chain().uniqueId().padStart(5, '0').value()`

## Acceptance criteria

- [ ] Rule file created at `configs/eslint/rules/prefer-lodash-chain.js`
- [ ] Rule registered and enabled as `error` in `configs/eslint/js.js`
- [ ] All valid cases pass without being flagged
- [ ] All invalid cases flagged with `preferChain` messageId
- [ ] All invalid cases produce correct auto-fix output
- [ ] Combined nesting+post-chain cases are skipped (not flagged)
- [ ] Tests pass via vitest
