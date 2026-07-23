## Issue 01 — no-abbreviated-names
### export default instead of named export
```js
export default {
  meta: { ... },
  create(context) { ... },
};
```
**Problem:** `modules.md` says always use named exports, never `export default`.
**Reason skipped:** All existing ESLint rules in this repo use `export default` and `js.js` imports them as default. This is the established pattern for rule files.

### for...of loop instead of lodash
```js
for (const matcher of matchers) {
```
**Problem:** Checklist says no `for` loops, use `_.each`/`_.map`.
**Reason skipped:** ESLint rule infra code; importing lodash into a lint rule config is inappropriate and non-standard.

### No __ pattern for buildMatcher
```js
function buildMatcher(entry) {
```
**Problem:** `modules.md` says private methods go on a `__` object for test mocking.
**Reason skipped:** Tested end-to-end via `RuleTester`; no need to mock internal helpers.

### RuleTester cases vs it.each
```js
ruleTester.run('aberlaas/no-abbreviated-names', rule, {
  valid: [ ... ],
  invalid: [ ... ],
});
```
**Problem:** Testing standards prefer `it.each` over many standalone blocks.
**Reason skipped:** `RuleTester.run` has its own array-of-cases API; forcing `it.each` would fight the framework.

### Double error on destructured shorthand
```js
{
  name: 'Flags destructured names',
  code: 'const { laptopDir } = obj;',
  errors: [
    { messageId: 'noAbbreviatedName' },
    { messageId: 'noAbbreviatedName' },
  ],
},
```
**Problem:** Spec says "Flags destructured names" but doesn't mention double errors.
**Reason skipped:** Natural AST behavior — shorthand destructuring produces two Identifier nodes. Fix is idempotent; test accounts for it.
