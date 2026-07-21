## TLDR

Add nested `_.xxx(_.yyy(...))` detection and complete combined fix to `prefer-lodash-chain` rule.

## What to build

Extend the existing `prefer-lodash-chain` rule to detect nested lodash calls
where the first argument of a `_.xxx()` call is itself a `_.xxx()` call.

Core logic additions:
- Nesting detector — for each `_.xxx()` call at the top of a chain, check if
  its first argument is also a `_.xxx()` call. Recursively unwrap for deep
  nesting (any depth).
- Report on the outermost `_.xxx()` call (or the top of the post-chain if one
  exists).
- Fix builder update — collect lodash methods from innermost to outermost, then
  append any post-chain methods. Produce
  `_.chain(collection).inner(...).outer(...).chainMethod(...).value()`.
- Remove the nesting guard from issue 01 — combined cases should now be flagged
  and fixed completely by both patterns.

For the combined case `_.map(_.filter(arr, pred), fn).join(sep)`:
- The post-chain detector fires on the `.join(sep)` node and produces the
  complete fix including nesting unwrap
- The nesting detector fires on the `_.map(...)` node and produces the complete
  fix including post-chain methods

## Behavioral Tests

**Valid cases (should not flag):**
- Accepts `_.map(arr, fn)` — single lodash call, no nesting
- Accepts `_.chain(arr).filter(pred).map(fn).value()` — already chained

**Invalid nesting cases (flag + verify fix):**
- Flags `_.map(_.filter(arr, pred), fn)` → `_.chain(arr).filter(pred).map(fn).value()`
- Flags `_.map(_.filter(_.sortBy(arr, sort), pred), fn)` → `_.chain(arr).sortBy(sort).filter(pred).map(fn).value()`

**Invalid combined cases (flag + verify fix):**
- Flags `_.map(_.filter(arr, pred), fn).join(sep)` → `_.chain(arr).filter(pred).map(fn).join(sep).value()`

**Updated valid case from issue 01:**
- Remove the valid case that skipped combined nesting+post-chain — it should now be invalid

## Acceptance criteria

- [ ] Nesting guard from issue 01 removed
- [ ] Simple nesting `_.xxx(_.yyy(...))` detected and fixed
- [ ] Deep nesting (3+ levels) detected and fixed
- [ ] Combined nesting+post-chain produces complete fix from both detectors
- [ ] All previous post-chain tests still pass
- [ ] Tests pass via vitest
