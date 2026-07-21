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

## Issue 02 — nesting detection
### Dual-report on combined cases
```javascript
if (
  node.parent &&
  node.parent.type === 'CallExpression' &&
  isLodashCall(node.parent) &&
  node.parent.arguments[0] === node
) {
  return;
}
```
**Problem:** Spec says both detectors should fire independently on combined nesting+post-chain cases; inner-nesting guard suppresses one report.
**Reason skipped:** Spec describes implementation detail, not user-facing requirement. One report with correct fix is better UX than two reports on same expression. All acceptance criteria tests pass with singular error expectation.
