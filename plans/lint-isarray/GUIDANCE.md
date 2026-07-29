## Guidance

- Test command: `yarn run test modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-methods.js`
- Lint command: `yarn run lint:fix modules/lint/configs/eslint/rules/js/prefer-lodash-methods.js`
- Prior art for rule: `modules/lint/configs/eslint/rules/js/prefer-lodash-is-empty.js` (custom rule with autofix)
- Prior art for test: `modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-keys.js` (uses `ruleTester.run()`)
- Rule registration: `modules/lint/configs/eslint/js.js` — import, add to `aberlaas` plugin `rules` object, enable in `rules` section
- The helper at `helpers/prefer-lodash-method.js` is only used by the 3 rules being deleted — safe to remove

## Discoveries
