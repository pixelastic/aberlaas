## Guidance

- Rule file: `modules/lint/configs/eslint/rules/prefer-lodash-chain.js`
- Test file: `modules/lint/configs/eslint/__tests__/prefer-lodash-chain.js`
- Registration: `modules/lint/configs/eslint/js.js`
- Run tests: `cd modules/lint && yarn vitest run configs/eslint/__tests__/prefer-lodash-chain.js`
- Prior art for rule structure: `rules/prefer-lodash-is-empty.js` (most complex existing rule)
- Prior art for test structure: `__tests__/prefer-lodash-is-empty.js`
- All lodash rules use `fixable: 'code'` and verify exact `output` in tests
- RuleTester wired to vitest via `RuleTester.describe = describe; RuleTester.it = it;`
- Severity: `error`, consistent with all `prefer-lodash-*` rules

## Discoveries
