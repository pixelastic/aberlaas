## Guidance

- Rule file: `modules/lint/configs/eslint/rules/prefer-expect-to-have-property.js`
- Test file: `modules/lint/configs/eslint/__tests__/prefer-expect-to-have-property.js`
- Config registration: `modules/lint/configs/eslint/js.js`
- Run tests: `yarn run test modules/lint/configs/eslint/__tests__/prefer-expect-to-have-property.js`
- Run lint: `yarn run lint:fix <filepath>`
- Prior art for rule structure: `modules/lint/configs/eslint/rules/prefer-lodash-is-empty.js`
- Prior art for test structure: `modules/lint/configs/eslint/__tests__/prefer-lodash-is-empty.js`
- All rules use ESM (`export default`)
- Tests wire `RuleTester.describe = describe` and `RuleTester.it = it` to vitest
- The rule uses `meta.fixable: 'code'` and `context.report({ fix(fixer) { ... } })`
- Property path: string format (`'foo.bar'`) for static segments, array format (`[key, 'foo']`) only when a computed variable is in the chain

## Discoveries

### Issue 03 — Nested paths & bracket notation
- Linter auto-converts `array.length === 0` to `_.isEmpty(array)`, requiring `import { _ } from 'golgoth'` in rule files
- ESLint rule `export default` is required by the ESLint rule API — the `modules.md` "no default export" standard doesn't apply here

### Issue 04 — Ignore method calls & resolves/rejects
- `resolves`/`rejects` in matcher chain makes `node.callee.object` a MemberExpression, not a CallExpression — incidental guard exists but explicit check is better for clarity and robustness
- `yarn run lint:fix` has a pre-existing `Unexpected token '<<'` error unrelated to this rule
