## Issue 01 — Core rule: dot-access to toEqual
### export default usage
```js
export default {
  meta: {
```
**Problem:** `modules.md` standard says no `export default`, always named exports
**Reason skipped:** All 8 existing sibling rule files use `export default` — changing just this one would be inconsistent with codebase convention

### JSDoc on fix callback
```js
fix(fixer) {
  return fixer.replaceText(
```
**Problem:** `style.md` requires JSDoc on all functions
**Reason skipped:** Inline anonymous callback inside config object — all sibling rules follow same pattern, judgement call
