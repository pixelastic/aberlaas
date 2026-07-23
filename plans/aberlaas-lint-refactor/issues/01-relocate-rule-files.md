## TLDR

Move rule files, helper, and tests into domain subdirectories (`rules/js/`, `rules/test/`) and update all imports.

## What to build

Reorganize the flat `rules/` directory into two domain subdirectories. This is a pure structural change — no plugin or activation changes.

**Create directories:**
- `rules/js/` — 10 rule files
- `rules/js/helpers/` — lodash helper
- `rules/js/__tests__/` — 10 test files
- `rules/test/` — 3 rule files
- `rules/test/__tests__/` — 3 test files

**Move JS rules to `rules/js/`:**
no-abbreviated-names, prefer-lodash-chain, prefer-lodash-entries, prefer-lodash-is-empty, prefer-lodash-keys, prefer-lodash-values, private-methods-no-rename, private-methods-no-wrapper, private-methods-ordering, test-file-naming

**Move test rules to `rules/test/`:**
no-manual-mock-cleanup, prefer-mock-return-value, prefer-expect-to-have-property

**Move helper:**
`rules/helpers/prefer-lodash-method.js` → `rules/js/helpers/prefer-lodash-method.js`

**Move test files** to `__tests__/` inside their respective subdirectory, matching the rule they test.

**Update imports:**
- `js.js` imports must point to `./rules/js/` (and `./rules/test/` temporarily for the 3 test rules until issue 02)
- Lodash rules importing the helper must use `./helpers/prefer-lodash-method.js` (relative path within `rules/js/`)
- Test files must update their imports to the new rule paths

**Delete** the old `rules/` files, `rules/helpers/` directory, and `__tests__/` files from their original location.

## Scaffolding Tests

- All 10 JS rule files exist under `rules/js/`
- All 3 test rule files exist under `rules/test/`
- Lodash helper exists at `rules/js/helpers/prefer-lodash-method.js`
- 10 test files exist under `rules/js/__tests__/`
- 3 test files exist under `rules/test/__tests__/`
- No rule files remain directly under `rules/` (only subdirectories)
- Old `rules/helpers/` directory removed

## Acceptance criteria

- [ ] All rule files relocated to correct subdirectory
- [ ] All test files relocated alongside their rules
- [ ] Lodash helper at `rules/js/helpers/`
- [ ] All imports updated (js.js, test files, lodash rules)
- [ ] No files remain in old locations
- [ ] All existing tests pass
