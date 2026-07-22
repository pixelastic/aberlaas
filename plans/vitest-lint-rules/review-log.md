## Issue 01 — no-manual-mock-cleanup
### export default vs named export
```javascript
export default {
  meta: { ... },
  create(context) { ... },
};
```
**Problem:** Standards say always use named exports, never `export default`
**Reason skipped:** All existing ESLint rule files in the project use `export default` — ESLint convention requires it

### Missing JSDoc on constant
```javascript
const bannedMethods = new Set([
  'restoreAllMocks',
  'clearAllMocks',
  'resetAllMocks',
]);
```
**Problem:** No JSDoc on `bannedMethods` constant
**Reason skipped:** Standard requires JSDoc on functions, not constants; the constant is self-documenting
