## TLDR

Ensure the rule ignores method calls in the expect argument chain and `resolves`/`rejects` assertion chains.

## What to build

Add guards so the rule does not flag:
- Method calls anywhere in the member expression chain inside `expect()` (e.g., `expect(a.foo().bar)`)
- `resolves` or `rejects` in the matcher chain (e.g., `expect(a.foo).resolves.toEqual(bar)`)

The member expression walker must check each node in the chain: if any node is a `CallExpression` (other than the outer `expect()` call itself), bail out.

For `resolves`/`rejects`, check the matcher chain between `expect(...)` and the final matcher call.

## Behavioral Tests

**Accepted (no flag):**
- Accepts `expect(a.foo().bar).toEqual(baz)` (method call in chain)
- Accepts `expect(a.getB().c).toEqual(d)` (method call in chain)
- Accepts `expect(a.foo).resolves.toEqual(bar)` (resolves chain)
- Accepts `expect(a.foo).rejects.toEqual(bar)` (rejects chain)

## Acceptance criteria

- [ ] Method calls in member expression chain cause the rule to skip
- [ ] `resolves` chain causes the rule to skip
- [ ] `rejects` chain causes the rule to skip
- [ ] All tests pass
