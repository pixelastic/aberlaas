## TLDR

Custom ESLint rule that autofixes mockResolvedValue/mockRejectedValue (and Once variants) to mockReturnValue/mockReturnValueOnce, plus migration of existing violations.

## What to build

Create a custom ESLint rule `aberlaas/prefer-mock-return-value` that detects calls to `mockResolvedValue`, `mockResolvedValueOnce`, `mockRejectedValue`, and `mockRejectedValueOnce` on any object. The rule autofixes by renaming the method:

- `mockResolvedValue` → `mockReturnValue`
- `mockResolvedValueOnce` → `mockReturnValueOnce`
- `mockRejectedValue` → `mockReturnValue`
- `mockRejectedValueOnce` → `mockReturnValueOnce`

Messages:
- For `Once` variants: "Use mockReturnValueOnce() instead"
- For non-Once variants: "Use mockReturnValue() instead"

The rule visits `MemberExpression` nodes and checks `property.name` against the four banned methods. Autofix replaces the property name.

Register the rule in the `aberlaas` plugin (in `js.js`). Activate it in `vitest.js` as `['error']`.

Migrate 5 existing violations in 4 files:
- `modules/lint/lib/__tests__/html.js` (line 55)
- `modules/lint/lib/__tests__/yml.js` (line 101)
- `modules/lint/lib/__tests__/css.js` (lines 119-120)
- `modules/release/lib/__tests__/ensureNpmLogin.js` (line 107)

All are `.mockResolvedValue()` or `.mockResolvedValue(true)` → `.mockReturnValue()` / `.mockReturnValue(true)`.

Prior art: `modules/lint/configs/eslint/rules/prefer-expect-to-have-property.js` for autofix pattern.

## Behavioral Tests

**Reports and fixes banned methods**
- should report and fix mockResolvedValue to mockReturnValue
- should report and fix mockResolvedValueOnce to mockReturnValueOnce
- should report and fix mockRejectedValue to mockReturnValue
- should report and fix mockRejectedValueOnce to mockReturnValueOnce

**Allows legitimate mock methods**
- should allow mockReturnValue
- should allow mockReturnValueOnce
- should allow mockImplementation

## Acceptance criteria

- [ ] Rule file created at `modules/lint/configs/eslint/rules/prefer-mock-return-value.js`
- [ ] Rule registered in `aberlaas` plugin in `modules/lint/configs/eslint/js.js`
- [ ] Rule activated as `['error']` in `modules/lint/configs/eslint/vitest.js`
- [ ] Test file created at `modules/lint/configs/eslint/__tests__/prefer-mock-return-value.js`
- [ ] All 5 violations in 4 files migrated to mockReturnValue
- [ ] All tests pass
- [ ] Lint passes on the codebase
