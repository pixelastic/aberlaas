## Guidance

- Rule file: `modules/lint/configs/eslint/rules/prefer-expect-to-have-property.js`
- Test file: `modules/lint/configs/eslint/__tests__/prefer-expect-to-have-property.js`
- Config registration: `modules/lint/configs/eslint/js.js`
- Run tests: `cd modules/lint && yarn vitest run configs/eslint/__tests__/prefer-expect-to-have-property.js`
- Prior art for rule structure: `modules/lint/configs/eslint/rules/prefer-lodash-is-empty.js`
- Prior art for test structure: `modules/lint/configs/eslint/__tests__/prefer-lodash-is-empty.js`
- All rules use ESM (`export default`)
- Tests wire `RuleTester.describe = describe` and `RuleTester.it = it` to vitest
- The rule uses `meta.fixable: 'code'` and `context.report({ fix(fixer) { ... } })`
- Property path: string format (`'foo.bar'`) for static segments, array format (`[key, 'foo']`) only when a computed variable is in the chain

## Discoveries
