## TLDR

Create the rule, register it, and handle the basic case: `expect(a.foo).toEqual(bar)` → `expect(a).toHaveProperty('foo', bar)`.

## What to build

Create `prefer-expect-to-have-property` rule that visits `CallExpression` nodes matching the pattern `expect(<memberExpr>).<matcher>(<args>)`.

For this slice, only handle:
- Single-level dot access: `expect(a.foo).toEqual(bar)`
- Only the `toEqual` matcher

The rule must ignore:
- `expect(a)` with no member expression (valid code)
- `.not` chains (by design)

Register the rule in the aberlaas plugin in the JS eslint config and enable it as `['error']`.

## Behavioral Tests

**Flagged and auto-fixed:**
- Flags `expect(a.foo).toEqual(bar)` and fixes to `expect(a).toHaveProperty('foo', bar)`
- Flags `expect(response.status).toEqual(200)` (any variable name, not just `actual`)

**Accepted (no flag):**
- Accepts `expect(a).toEqual(bar)` (no member expression in expect)
- Accepts `expect(a.foo).not.toEqual(bar)` (`.not` chain ignored)

## Acceptance criteria

- [ ] Rule file created at `modules/lint/configs/eslint/rules/prefer-expect-to-have-property.js`
- [ ] Rule imported and registered in the aberlaas plugin in `modules/lint/configs/eslint/js.js`
- [ ] Rule enabled as `['error']` in `js.js`
- [ ] `expect(a.foo).toEqual(bar)` flagged and auto-fixed
- [ ] `expect(a).toEqual(bar)` not flagged
- [ ] `.not` chains not flagged
- [ ] All tests pass
