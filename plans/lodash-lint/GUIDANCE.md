## Guidance

- **Testing:** `yarn vitest run` from repo root, or target specific test files with `yarn vitest run modules/lint/configs/eslint/__tests__/<test-file>.js`
- **Rule files:** `modules/lint/configs/eslint/rules/`
- **Helper files:** `modules/lint/configs/eslint/rules/helpers/`
- **Test files:** `modules/lint/configs/eslint/__tests__/`
- **Registration:** `modules/lint/configs/eslint/js.js` — import rule, add to `plugins.aberlaas.rules`, add to `rules` section with `['error']`
- **Prior art:** `private-methods-no-wrapper.js` is the best reference — it has autofix, uses `_` from golgoth, and follows the same meta/create pattern
- **Test prior art:** `__tests__/private-methods-ordering.js` — uses RuleTester with vitest wiring, includes autofix output assertions
- **Convention:** Rules fire unconditionally (no `_` import check). Severity `error`. Each rule file keeps full scaffolding.

## Discoveries
