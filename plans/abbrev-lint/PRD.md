## Problem Statement

Abbreviated variable names (`laptopDir`, `absPath`) keep slipping through code review despite the JS Writer style convention saying "No abbreviated variable names." Manual review is unreliable — we need automated enforcement.

## Solution

Add a custom auto-fixable ESLint rule `no-abbreviated-names` to the aberlaas lint module. The rule flags identifiers containing abbreviated prefixes or suffixes at camelCase boundaries and auto-fixes them to their expanded form.

Initial abbreviation map:

- Suffix `Dir` → `Directory` (e.g. `laptopDir` → `laptopDirectory`)
- Prefix `abs` → `absolute` (e.g. `absPath` → `absolutePath`)

## User Stories

1. As a developer, I want `laptopDir` flagged as an error, so that abbreviated suffixes don't pass CI
2. As a developer, I want `absPath` flagged as an error, so that abbreviated prefixes don't pass CI
3. As a developer, I want `--fix` to auto-correct `laptopDir` to `laptopDirectory`, so that I don't have to rename manually
4. As a developer, I want `--fix` to auto-correct `absPath` to `absolutePath`, so that I don't have to rename manually
5. As a developer, I want `laptopDirPath` flagged and fixed to `laptopDirectoryPath`, so that mid-word abbreviations are caught too
6. As a developer, I want `directory` and `dirt` NOT flagged, so that non-camelCase occurrences of "dir" are ignored
7. As a developer, I want `absorb` and `abstract` NOT flagged, so that words starting with "abs" that aren't abbreviations are ignored
8. As a developer, I want standalone `Dir` and `abs` NOT flagged, so that single-segment identifiers are left alone
9. As a developer, I want property names like `obj.laptopDir` flagged, so that the convention applies uniformly to all identifiers
10. As a developer, I want object keys like `{ laptopDir: value }` flagged, so that object literal keys follow the convention
11. As a developer, I want function parameter names flagged, so that `function foo(absPath)` is caught
12. As a developer, I want destructured names flagged, so that `const { laptopDir } = config` is caught
13. As a developer, I want to use `eslint-disable` for external API names I can't control, so that false positives are manageable
14. As a developer, I want `LAPTOP_DIR` (SCREAMING_SNAKE_CASE) NOT flagged, so that the rule only targets camelCase boundaries
15. As a developer, I want the error message to tell me the expanded form, so that I know what to rename to

## Implementation Decisions

- **Single rule with built-in abbreviation map.** The abbreviation patterns are hardcoded in the rule — not configurable via ESLint schema. New abbreviations are added by editing the map in the rule file.
- **Two pattern types: prefix and suffix.** Each entry in the abbreviation map specifies its position (prefix or suffix) and boundary condition:
  - Suffix patterns (e.g. `Dir`): require a lowercase letter before — matches camelCase boundary, avoids standalone `Dir`
  - Prefix patterns (e.g. `abs`): require an uppercase letter after — matches camelCase boundary, avoids standalone `abs` and words like `absorb`
- **`Identifier` AST visitor.** The rule visits every `Identifier` node — variables, parameters, function names, properties, object keys, class members. No scope analysis, no special-casing of declaration vs. reference.
- **Simple string replacement for fixes.** Replace the abbreviated substring with its expansion. CamelCase casing is preserved naturally because the expansions maintain the same boundary structure.
- **Registered in the `aberlaas` plugin in `js.js`.** Same pattern as all other custom rules: import, add to plugin `rules` object, enable in `rules` config.

## Testing Decisions

- **Only the rule module is tested.** Registration in `js.js` is pure wiring.
- **Use ESLint `RuleTester`**, same as all existing custom rule tests in the codebase (e.g. `prefer-lodash-keys` test file).
- **Test cases should cover:**
  - Valid: `laptopDirectory`, `absolutePath`, `directory`, `dirt`, `absorb`, `abstract`, `Dir` alone, `abs` alone, `LAPTOP_DIR`
  - Invalid with fix: `laptopDir` → `laptopDirectory`, `absPath` → `absolutePath`, `laptopDirPath` → `laptopDirectoryPath`, property access, object key, function param, destructured name
- **Prior art:** `modules/lint/configs/eslint/__tests__/prefer-lodash-keys.js` — same `RuleTester.describe = describe` + `RuleTester.it = it` pattern wired to vitest.

## Out of Scope

- SCREAMING_SNAKE_CASE support
- Configurable abbreviation map via ESLint rule options/schema
- Scope-aware renaming (renaming declaration + all references in one fix)
- Abbreviations beyond `Dir`/`abs` (can be added later by extending the map)
- Non-identifier contexts (string literals, comments, filenames)

## Further Notes

The abbreviation map is designed to be easily extensible. Adding a new pattern is one object in the array with `pattern`, `replacement`, `position`, and `messageId`. The architecture supports both prefix and suffix patterns, so future abbreviations can be added with minimal effort.
