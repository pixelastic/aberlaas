## Issue 01 — identifier detection
### export default instead of named export
```js
export default {
  meta: { ... },
  create(context) { ... },
};
```
**Problem:** js-writer modules.md requires named exports, not `export default`
**Reason skipped:** All 14 existing ESLint rules in this repo use `export default`. This is the established convention for ESLint rule files.

### for...of loop instead of lodash iteration
```js
for (const term of termKeys) {
```
**Problem:** js-writer checklist forbids `for` loops, preferring `_.each`/`_.map`
**Reason skipped:** Prior art (`no-abbreviated-names.js`) uses the same pattern. `_.each` cannot short-circuit with `return`, which is needed here for the return-early pattern.
