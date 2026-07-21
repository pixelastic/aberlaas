## TLDR

Handle nested dot paths, bracket string literals, bracket variables, and mixed chains with array format.

## What to build

Extend the member expression chain walker to extract a property path from any combination of:
- Dot access: `a.foo.bar` → path `'foo.bar'`
- Bracket with string literal: `a['foo']` → path `'foo'`
- Bracket with variable: `a[key]` → path `key` (the variable itself)
- Mixed: `a[key].foo` → path `[key, 'foo']` (array format)

Path format rules:
- Use string format (`'foo.bar'`) when all segments are static (identifiers or string literals)
- Use array format (`[key, 'foo']`) only when a computed variable is present anywhere in the chain

## Behavioral Tests

**Flagged and auto-fixed:**
- Flags `expect(a.foo.bar).toEqual(baz)` → `expect(a).toHaveProperty('foo.bar', baz)`
- Flags `expect(a['foo']).toEqual(bar)` → `expect(a).toHaveProperty('foo', bar)`
- Flags `expect(a[key]).toEqual(bar)` → `expect(a).toHaveProperty(key, bar)`
- Flags `expect(a[key].foo).toBe(bar)` → `expect(a).toHaveProperty([key, 'foo'], bar)`
- Flags `expect(a.foo[key]).toEqual(bar)` → `expect(a).toHaveProperty(['foo', key], bar)`
- Flags `expect(a.foo.bar.baz).toEqual(x)` → `expect(a).toHaveProperty('foo.bar.baz', x)` (deeply nested)

## Acceptance criteria

- [ ] Nested dot access produces string path with dots
- [ ] Bracket string literal treated like dot access
- [ ] Bracket variable passed as-is (single segment)
- [ ] Mixed chain produces array format
- [ ] Array format only used when a computed variable is present
- [ ] All tests pass
