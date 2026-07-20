## TLDR

Add 3 ESLint rules (`prefer-lodash-keys`, `prefer-lodash-values`, `prefer-lodash-entries`) with autofix, sharing a common helper.

## What to build

Create a shared helper that matches `Object.<method>(...)` call expressions and auto-fixes them to `_.<method>(...)`. Then create 3 rule files — one per method — each keeping full scaffolding (`meta`, `create()`) and calling the helper internally. Register all 3 in `js.js` under the `aberlaas` plugin namespace at severity `error`. Add test files for each rule.

The helper should:
- Match `CallExpression` nodes where callee is `Object.<methodName>`
- Report with a clear message (e.g. "Use `_.keys()` instead of `Object.keys()`")
- Autofix by replacing `Object` with `_` in the source text

Rules fire unconditionally (no `_` import check). No optional chaining, no bracket notation.

## Behavioral Tests

**prefer-lodash-keys:**
- flags `Object.keys(foo)` and fixes to `_.keys(foo)`
- accepts `_.keys(foo)` without error
- does not flag `Object.freeze(foo)` or other unrelated Object methods
- flags `Object.keys(foo.bar)` (nested member expression as argument)

**prefer-lodash-values:**
- flags `Object.values(foo)` and fixes to `_.values(foo)`
- accepts `_.values(foo)` without error

**prefer-lodash-entries:**
- flags `Object.entries(foo)` and fixes to `_.entries(foo)`
- accepts `_.entries(foo)` without error

## Acceptance criteria

- [ ] Shared helper exists and is used by all 3 rules
- [ ] Each rule has its own file with full meta/create scaffolding
- [ ] All 3 rules registered in `js.js` at severity `error`
- [ ] Autofix replaces `Object.keys/values/entries(x)` with `_.keys/values/entries(x)`
- [ ] All tests pass
