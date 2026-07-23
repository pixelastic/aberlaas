## TLDR

Add auto-fixable ESLint rule `no-abbreviated-names` that flags `Dir` → `Directory` and `abs` → `absolute` at camelCase boundaries.

## What to build

Create a custom ESLint rule in `modules/lint/configs/eslint/rules/no-abbreviated-names.js` that:

- Visits every `Identifier` AST node
- Checks the identifier name against an abbreviation map with two pattern types:
  - **Suffix** (`Dir`): matches when preceded by a lowercase letter (camelCase boundary). Regex: `/([a-z])Dir([A-Z]|$)/`
  - **Prefix** (`abs`): matches when followed by an uppercase letter (camelCase boundary). Regex: `/^abs([A-Z])/`
- Reports a violation with a message showing the expected expanded form
- Auto-fixes by replacing the abbreviated substring with its expansion (simple string replacement)

Register the rule in `modules/lint/configs/eslint/js.js`: import it, add to the `aberlaas` plugin `rules` object, enable as `'aberlaas/no-abbreviated-names': ['error']`.

Follow existing rule patterns (e.g. `prefer-lodash-keys`, `test-file-naming`).

## Behavioral Tests

Use `RuleTester` wired to vitest, same as `__tests__/prefer-lodash-keys.js`.

**Suffix Dir → Directory**
- Flags `laptopDir` and fixes to `laptopDirectory`
- Flags `consoleDir` and fixes to `consoleDirectory`
- Flags `laptopDirPath` mid-word and fixes to `laptopDirectoryPath`
- Does not flag `directory` (no camelCase boundary)
- Does not flag `dirt` (no camelCase boundary)
- Does not flag `Dir` alone (no lowercase letter before)
- Does not flag `LAPTOP_DIR` (SCREAMING_SNAKE_CASE, not camelCase)

**Prefix abs → absolute**
- Flags `absPath` and fixes to `absolutePath`
- Does not flag `absorb` (no uppercase after)
- Does not flag `abstract` (no uppercase after)
- Does not flag `abs` alone (no uppercase after)

**Identifier types**
- Flags function parameter names
- Flags object property keys
- Flags destructured names

## Acceptance criteria

- [ ] Rule file created at `modules/lint/configs/eslint/rules/no-abbreviated-names.js`
- [ ] Rule registered and enabled in `modules/lint/configs/eslint/js.js`
- [ ] All behavioral tests pass
- [ ] `--fix` auto-corrects all flagged identifiers
- [ ] No false positives on `directory`, `dirt`, `absorb`, `abstract`, standalone `Dir`/`abs`, SCREAMING_SNAKE_CASE
