## Guidance

- **Testing:** `yarn run test modules/lint/configs/eslint/__tests__/no-exclusionary-terms.js`
- **Linting:** `yarn run lint:fix modules/lint/configs/eslint/rules/no-exclusionary-terms.js`
- **Rule file:** `modules/lint/configs/eslint/rules/no-exclusionary-terms.js`
- **Test file:** `modules/lint/configs/eslint/__tests__/no-exclusionary-terms.js`
- **Registration:** `modules/lint/configs/eslint/js.js`
- **Prior art:** `modules/lint/configs/eslint/rules/no-abbreviated-names.js` and its test at `modules/lint/configs/eslint/__tests__/no-abbreviated-names.js`
- **Test pattern:** `RuleTester` wired to vitest (`RuleTester.describe = describe; RuleTester.it = it;`)
- **Convention:** All custom rules use `schema: []`, `type: 'suggestion'`, and are enabled at `['error']`

## Discoveries
