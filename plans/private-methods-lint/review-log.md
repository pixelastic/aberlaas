## Issue 01 — no-wrapper
### export default in ESLint rule
```js
export default {
  meta: { ... },
  create(context) { ... },
};
```
**Problem:** `modules.md` says no `export default`, always named exports.
**Reason skipped:** Existing ESLint rule `test-file-naming.js` uses `export default`. This is the established pattern for ESLint rules in this repo.

### for...of loop in rule visitor
```js
for (const property of node.right.properties) {
```
**Problem:** `style.md` says no `for` loops, prefer `_.each`/`_.map`.
**Reason skipped:** ESLint rule visitors don't import lodash. `for...of` with early `continue` is the pragmatic pattern here.
