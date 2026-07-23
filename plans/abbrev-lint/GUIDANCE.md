## Guidance

- Run tests: `yarn run test modules/lint/configs/eslint/__tests__/no-abbreviated-names.js`
- Run lint: `yarn run lint:fix modules/lint/configs/eslint/rules/no-abbreviated-names.js`
- Rule file: `modules/lint/configs/eslint/rules/no-abbreviated-names.js`
- Test file: `modules/lint/configs/eslint/__tests__/no-abbreviated-names.js`
- Registration: `modules/lint/configs/eslint/js.js` — import + plugin rules + rules config
- Prior art for rules: `modules/lint/configs/eslint/rules/prefer-lodash-keys.js`
- Prior art for tests: `modules/lint/configs/eslint/__tests__/prefer-lodash-keys.js`
- RuleTester wiring: `RuleTester.describe = describe; RuleTester.it = it;`

## Discoveries
