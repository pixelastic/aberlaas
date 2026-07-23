## Guidance

- **Test command**: `yarn run test <filepath>`
- **Lint command**: `yarn run lint:fix <filepath>`
- **Rule files**: `modules/lint/configs/eslint/rules/` (current flat layout, will become `rules/js/` and `rules/test/`)
- **Config files**: `modules/lint/configs/eslint/js.js`, `modules/lint/configs/eslint/vitest.js`
- **Test files**: `modules/lint/configs/eslint/__tests__/` (current location, will move into `rules/js/__tests__/` and `rules/test/__tests__/`)
- **Lodash helper**: `modules/lint/configs/eslint/rules/helpers/prefer-lodash-method.js` (will move to `rules/js/helpers/`)
- The `vitest-config.js` test file in `__tests__/` tests the vitest config itself — it stays in place, do not move it
- All paths in issue files are relative to `modules/lint/configs/eslint/`
- ESLint version: 9.39.2 — use `context.sourceCode`, not `context.getSourceCode()`

## Discoveries
