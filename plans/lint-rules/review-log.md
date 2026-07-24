## Issue 02 — no-jsdoc-on-proxy
### export default instead of named export
```js
export default {
  meta: {
```
**Problem:** Standards agent flagged `export default` as violating the named-export convention.
**Reason skipped:** All existing ESLint rule files in this repo use `export default`. This is the established convention for rule modules.

### Missing JSDoc on AssignmentExpression visitor
```js
AssignmentExpression(node) {
```
**Problem:** No JSDoc on the visitor callback function.
**Reason skipped:** Judgement call — no existing rule in this repo has JSDoc on ESLint visitor callbacks. These are convention-named AST visitors, not standalone functions.
