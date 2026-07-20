## TLDR

Add ESLint rule `prefer-lodash-isempty` with autofix for `.length` comparisons to `0`.

## What to build

Create a standalone rule that matches `BinaryExpression` nodes comparing `.length` to `0`. The rule detects 5 patterns and auto-fixes them:

| Pattern | Fix |
|---|---|
| `x.length === 0` | `_.isEmpty(x)` |
| `x.length == 0` | `_.isEmpty(x)` |
| `x.length !== 0` | `!_.isEmpty(x)` |
| `x.length != 0` | `!_.isEmpty(x)` |
| `x.length > 0` | `!_.isEmpty(x)` |

The rule should:
- Match `BinaryExpression` where one side is a `MemberExpression` with property `length` and the other side is literal `0`
- Only match when `.length` is on the left side (no Yoda conditions)
- Determine emptiness vs non-emptiness based on the operator
- Autofix by replacing the entire binary expression with `_.isEmpty(x)` or `!_.isEmpty(x)`
- Not flag variants with `1` (`< 1`, `>= 1`)

Register in `js.js` under `aberlaas` plugin at severity `error`. Fire unconditionally.

## Behavioral Tests

**Empty patterns (fix to `_.isEmpty(x)`):**
- flags `x.length === 0` and fixes to `_.isEmpty(x)`
- flags `x.length == 0` and fixes to `_.isEmpty(x)`

**Non-empty patterns (fix to `!_.isEmpty(x)`):**
- flags `x.length !== 0` and fixes to `!_.isEmpty(x)`
- flags `x.length != 0` and fixes to `!_.isEmpty(x)`
- flags `x.length > 0` and fixes to `!_.isEmpty(x)`

**Valid code (no flag):**
- accepts `_.isEmpty(x)` without error
- does not flag `x.count === 0` (not `.length`)
- does not flag `x.length === 1` (not `0`)
- does not flag `x.length < 1` (variant with `1`)

**Complex expressions:**
- flags `foo.bar.length === 0` and fixes to `_.isEmpty(foo.bar)`

## Acceptance criteria

- [ ] Rule file with full meta/create scaffolding
- [ ] Registered in `js.js` at severity `error`
- [ ] All 5 operator patterns detected and auto-fixed correctly
- [ ] Variants with `1` are NOT flagged
- [ ] Yoda conditions are NOT flagged
- [ ] All tests pass
