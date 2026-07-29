## TLDR

Replace `prefer-lodash-keys`, `prefer-lodash-values`, `prefer-lodash-entries` and their helper with a single `prefer-lodash-methods` rule, add `Array.isArray` ban, wire up in `js.js`, delete old files.

## What to build

Create `modules/lint/configs/eslint/rules/js/prefer-lodash-methods.js` with a declarative `from`/`to` mapping:

- `Object.keys` -> `_.keys`
- `Object.values` -> `_.values`
- `Object.entries` -> `_.entries`
- `Array.isArray` -> `_.isArray`

The rule iterates the mapping, splits `from`/`to` on `.` to extract object and method names, and creates a `CallExpression` visitor that flags matches and autofixes by replacing the callee object text. Single `messageId` `preferLodash` with a dynamic message per entry.

Delete:
- `modules/lint/configs/eslint/rules/js/prefer-lodash-keys.js`
- `modules/lint/configs/eslint/rules/js/prefer-lodash-values.js`
- `modules/lint/configs/eslint/rules/js/prefer-lodash-entries.js`
- `modules/lint/configs/eslint/rules/js/helpers/prefer-lodash-method.js`
- `modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-keys.js`
- `modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-values.js`
- `modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-entries.js`

Update `modules/lint/configs/eslint/js.js`: remove 3 imports/registrations/enables, add 1 of each for `prefer-lodash-methods`.

Create `modules/lint/configs/eslint/rules/js/__tests__/prefer-lodash-methods.js` covering all entries.

## Behavioral Tests

**Object.keys**
- Flags `Object.keys(foo)` and fixes to `_.keys(foo)`
- Flags `Object.keys(foo.bar)` with nested argument
- Accepts `_.keys(foo)`
- Does not flag `Object.freeze(foo)`

**Object.values**
- Flags `Object.values(foo)` and fixes to `_.values(foo)`
- Accepts `_.values(foo)`

**Object.entries**
- Flags `Object.entries(foo)` and fixes to `_.entries(foo)`
- Accepts `_.entries(foo)`

**Array.isArray**
- Flags `Array.isArray(foo)` and fixes to `_.isArray(foo)`
- Accepts `_.isArray(foo)`
- Does not flag `Array.from(foo)`

## Acceptance criteria

- [ ] `prefer-lodash-methods.js` rule exists with 4 from/to entries
- [ ] All 4 old files deleted (3 rules + helper)
- [ ] All 3 old test files deleted
- [ ] `js.js` registers and enables only `prefer-lodash-methods`
- [ ] All behavioral tests pass
- [ ] `yarn run lint:fix` passes on the lint module itself
