## TLDR

Extend the rule to handle `toBe` and `toBeDefined` matchers.

## What to build

Add `toBe` and `toBeDefined` to the set of handled matchers in the rule.

- `toBe(val)` → same fix as `toEqual`: `toHaveProperty('key', val)`
- `toBeDefined()` → `toHaveProperty('key')` (no second argument)

Unhandled matchers (toContain, toHaveLength, toStrictEqual, etc.) must be silently ignored.

## Behavioral Tests

**Flagged and auto-fixed:**
- Flags `expect(a.foo).toBe(bar)` and fixes to `expect(a).toHaveProperty('foo', bar)`
- Flags `expect(a.foo).toBeDefined()` and fixes to `expect(a).toHaveProperty('foo')`

**Accepted (no flag):**
- Accepts `expect(a.foo).toContain('x')` (unhandled matcher)
- Accepts `expect(a.foo).toHaveLength(3)` (unhandled matcher)

## Acceptance criteria

- [ ] `expect(a.foo).toBe(bar)` flagged and auto-fixed
- [ ] `expect(a.foo).toBeDefined()` flagged and auto-fixed to `toHaveProperty('foo')` with no value argument
- [ ] Unhandled matchers silently ignored
- [ ] All tests pass
