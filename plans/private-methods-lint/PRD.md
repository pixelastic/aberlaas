## Problem Statement

The `__` private methods pattern (used for testable module internals) has three recurring mistakes that slip through code review: verbose wrappers that should be shorthand references, shorthand pass-throughs mixed randomly among real methods instead of grouped at the end, and renamed keys that obscure which function is actually being exposed. These are all deterministically lintable.

## Solution

Three custom ESLint rules in the existing `aberlaas` plugin that lint `__ = { ... }` object expressions, catching each mistake with clear messages and autofixing where safe. A final pass re-lints the aberlaas codebase itself to fix any existing violations.

## User Stories

1. As a developer, I want a lint error when I write `pushGame(game, cd) { return pushGame(game, cd); }` inside `__`, so that I use the shorthand `pushGame,` instead.
2. As a developer, I want the linter to autofix same-name verbose wrappers to shorthand properties, so that I don't have to fix them manually.
3. As a developer, I want a warning (no autofix) when I write a wrapper with a different key name than the called function, so that I'm guided to use the original function name as shorthand.
4. As a developer, I want the wrapper rule to handle all forms: method syntax, arrow syntax, async methods, and `return await`, so that no variant slips through.
5. As a developer, I want value-to-function adapters like `getConsoleList: () => consoleList` to be ignored, so that legitimate patterns aren't flagged.
6. As a developer, I want a lint error when shorthand properties appear before non-shorthand properties in `__`, so that real methods are always grouped first and pass-throughs last.
7. As a developer, I want the ordering rule to autofix by moving all shorthands to the end while preserving relative order within each group, so that the fix is predictable.
8. As a developer, I want a warning when I write `{ readGamelist: readRemoteGamelist }` (renamed identifier reference) inside `__`, so that I'm guided to use `readRemoteGamelist,` directly.
9. As a developer, I want the rename rule to only flag `key: differentIdentifier` pairs (not arrows, calls, or same-name), so that false positives don't erode trust.
10. As a maintainer, I want the aberlaas codebase itself re-linted with these new rules, so that existing violations are fixed.

## Implementation Decisions

- All three rules share the same entry point: an `AssignmentExpression` visitor that checks `left.name === '__'` and `right.type === 'ObjectExpression'`. This is a 3-line guard — no shared helper extraction needed.
- **`private-methods-no-wrapper`**: walks each property, checks if body is a single `return fn(args)` (or `return await fn(args)`), verifies args match params by name and count. Autofix replaces the entire property node with shorthand when key === callee. Warns with message when names differ.
- **`private-methods-ordering`**: operates on the property list as a whole. Partitions into non-shorthand and shorthand groups, checks if any shorthand appears before a non-shorthand. Autofix replaces the entire object body with non-shorthands first, shorthands last, preserving relative order and source text (comments, whitespace between properties).
- **`private-methods-no-rename`**: per-property check. Flags `Property` nodes where `!computed && !shorthand && value.type === 'Identifier' && key.name !== value.name`. No autofix — the developer must decide whether to rename the key or the import.
- Registration: import all 3 rules in `js.js`, add to the `aberlaas` plugin `rules` object, enable as `'error'` in the rules config.
- Each rule is a standalone ESM file exporting `{ meta, create }`, following the `test-file-naming` structure.

## Testing Decisions

- All 3 rules are pure AST logic with no side effects — ideal for `RuleTester`.
- Tests use the existing pattern: ESM imports, `RuleTester.describe = describe; RuleTester.it = it;` for vitest wiring.
- **no-wrapper tests**: method syntax, arrow syntax, async method, async arrow, `return await`, same-name autofix output, different-name warning message, multi-param, zero-param, value adapter exclusion, body with multiple statements (valid).
- **ordering tests**: already correct (valid), all shorthand (valid), all methods (valid), single shorthand before method (invalid + autofix output), multiple mixed (invalid + autofix output), preserves comments.
- **no-rename tests**: renamed identifier (invalid + message), same-name shorthand (valid), arrow value (valid), call expression value (valid), computed property (valid).
- Prior art: `__tests__/test-file-naming.js`.

## Out of Scope

- The `getConsoleList: () => consoleList` value-to-function adapter pattern — not a wrapper.
- Comment or blank-line separators between method groups — ordering is the only convention.
- Rules for anything outside `__ = { ... }` assignments.
- Linting non-JS files or other object patterns.

## Further Notes

- The final issue (re-lint aberlaas codebase) is a separate task that depends on all 3 rules being merged first.
- Each rule should be its own issue for independent review and merge.
