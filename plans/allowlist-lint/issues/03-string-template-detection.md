## TLDR

Add string and template literal detection to the `no-exclusionary-terms` rule (report-only, no auto-fix).

## What to build

Extend the rule's `create` function with two additional visitors:

1. `Literal` — check `node.value` when it's a string. If it contains `whitelist` or `blacklist` (case-insensitive), report an error with no fix.

2. `TemplateLiteral` — iterate over `node.quasis` (the `TemplateElement` nodes). Check each `quasi.value.raw` for matches. Report an error on the quasi node with no fix.

No auto-fix for either — changing string content could break runtime behavior (API routes, log messages, external interfaces).

## Behavioral Tests

**Invalid — string literals (report-only):**
- Flags `'whitelist'` with no fix output
- Flags `"add to blacklist"` with no fix output
- Flags `'Whitelisted'` with no fix output

**Invalid — template literals (report-only):**
- Flags `` `blacklist` `` with no fix output
- Flags `` `add to whitelist` `` with no fix output

## Acceptance criteria

- [ ] `Literal` visitor detects strings containing the terms
- [ ] `TemplateLiteral` visitor detects template quasis containing the terms
- [ ] Both report errors but provide NO auto-fix
- [ ] All behavioral tests pass
