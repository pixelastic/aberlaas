## Guidance

- Rule file: `modules/lint/configs/eslint/rules/prefer-lodash-chain.js`
- Test file: `modules/lint/configs/eslint/__tests__/prefer-lodash-chain.js`
- Registration: `modules/lint/configs/eslint/js.js`
- Run tests: `yarn run test configs/eslint/__tests__/prefer-lodash-chain.js`
- Prior art for rule structure: `rules/prefer-lodash-is-empty.js` (most complex existing rule)
- Prior art for test structure: `__tests__/prefer-lodash-is-empty.js`
- All lodash rules use `fixable: 'code'` and verify exact `output` in tests
- RuleTester wired to vitest via `RuleTester.describe = describe; RuleTester.it = it;`
- Severity: `error`, consistent with all `prefer-lodash-*` rules

## Discoveries

### Issue 01 — post-chain detection
- Rule files that use `.length` checks should `import { _ } from 'golgoth'` so `prefer-lodash-is-empty` auto-fix works (3 existing rules already do this)
- Run tests with `yarn run test`, not `yarn vitest run`
