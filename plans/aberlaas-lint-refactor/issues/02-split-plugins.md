## TLDR

Split monolithic `aberlaas` plugin into `aberlaas` (js.js, 10 rules) and `aberlaas-test` (vitest.js, 3 rules), each defined inline.

## What to build

**js.js changes:**
- Remove imports for the 3 test rules (no-manual-mock-cleanup, prefer-mock-return-value, prefer-expect-to-have-property)
- Remove those 3 rules from the `aberlaas` plugin registration
- Remove `prefer-expect-to-have-property` from rule activation (it was activated in js.js)
- Keep all 10 JS rule imports, registration, and activation unchanged

**vitest.js changes:**
- Add imports for 3 rule files from `./rules/test/`
- Define `aberlaas-test` plugin inline with those 3 rules
- Register the plugin in the `plugins` object
- Change rule activation from `aberlaas/no-manual-mock-cleanup` → `aberlaas-test/no-manual-mock-cleanup` (same for prefer-mock-return-value)
- Add `aberlaas-test/prefer-expect-to-have-property` activation (moved from js.js)

After this, each config is fully self-contained — vitest.js no longer depends on js.js having registered any rules.

## Scaffolding Tests

- js.js plugin registration contains exactly 10 rules
- vitest.js defines its own `aberlaas-test` plugin with exactly 3 rules
- vitest.js does not reference the `aberlaas/` namespace for any rule activation
- js.js does not import from `rules/test/`

## Acceptance criteria

- [ ] js.js registers only 10 rules under `aberlaas`
- [ ] vitest.js defines `aberlaas-test` plugin inline with 3 rules
- [ ] vitest.js activates rules under `aberlaas-test/` prefix
- [ ] `prefer-expect-to-have-property` activated in vitest.js, not js.js
- [ ] No cross-config coupling — each config can load independently
- [ ] All existing tests pass
