## Issue 01 — post-chain detection
### export default vs named export
```js
export default {
```
**Problem:** `modules.md` requires named exports, not `export default`
**Reason skipped:** All existing ESLint rule files in the repo use `export default` — changing this one would be inconsistent with sibling files

### eslint-disable comment
```js
/* eslint-disable aberlaas/prefer-lodash-is-empty */
```
**Problem:** File-level eslint-disable noted
**Reason skipped:** Necessary — rule file uses `.length` checks on AST nodes, `_` is not available in this context
