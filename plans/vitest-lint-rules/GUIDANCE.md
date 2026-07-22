## Guidance

- Testing commands: `yarn run test <filepath>` and `yarn run lint:fix <filepath>`
- Custom ESLint rules live in `modules/lint/configs/eslint/rules/`
- Custom rule tests live in `modules/lint/configs/eslint/__tests__/`
- Rules are registered in the `aberlaas` plugin in `modules/lint/configs/eslint/js.js` (import + plugin entry)
- Vitest-specific rules are activated in `modules/lint/configs/eslint/vitest.js`
- Test pattern: `RuleTester` from `eslint`, wired to vitest globals via `RuleTester.describe = describe; RuleTester.it = it;`
- Prior art for rule with autofix: `modules/lint/configs/eslint/rules/prefer-expect-to-have-property.js`
- Prior art for rule test: `modules/lint/configs/eslint/__tests__/test-file-naming.js`
- Issues 01, 02, 03 are independent — no dependency order

## Discoveries
