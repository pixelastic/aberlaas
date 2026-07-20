## Guidance

- **Testing:** `yarn run test <filepath>` to run specific test files
- **Rule files:** `modules/lint/configs/eslint/rules/`
- **Helper files:** `modules/lint/configs/eslint/rules/helpers/`
- **Test files:** `modules/lint/configs/eslint/__tests__/`
- **Registration:** `modules/lint/configs/eslint/js.js` — import rule, add to `plugins.aberlaas.rules`, add to `rules` section with `['error']`
- **Prior art:** `private-methods-no-wrapper.js` is the best reference — it has autofix, uses `_` from golgoth, and follows the same meta/create pattern
- **Test prior art:** `__tests__/private-methods-ordering.js` — uses RuleTester with vitest wiring, includes autofix output assertions
- **Convention:** Rules fire unconditionally (no `_` import check). Severity `error`. Each rule file keeps full scaffolding.

## Discoveries

### Issue 01 — prefer-lodash-object-methods
- `package.json` `files` array must include `configs/eslint/rules/helpers/*.js` for `n/no-unpublished-import` to pass on helper imports
