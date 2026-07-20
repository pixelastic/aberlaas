## Problem Statement

Native JS constructs (`Object.keys()`, `Object.values()`, `Object.entries()`, `x.length === 0`) are used inconsistently when lodash equivalents (`_.keys()`, `_.values()`, `_.entries()`, `_.isEmpty()`) exist. The codebase convention is lodash-everywhere (imported as `_` from `golgoth`), but nothing enforces it — violations slip in silently.

## Solution

Add 4 new ESLint rules under the `aberlaas` plugin namespace, each with autofix support so `lint:fix` corrects violations automatically. Rules are independently toggleable.

## User Stories

1. As a developer, I want `Object.keys(x)` to be auto-fixed to `_.keys(x)`, so that lodash usage stays consistent
2. As a developer, I want `Object.values(x)` to be auto-fixed to `_.values(x)`, so that lodash usage stays consistent
3. As a developer, I want `Object.entries(x)` to be auto-fixed to `_.entries(x)`, so that lodash usage stays consistent
4. As a developer, I want `x.length === 0` to be auto-fixed to `_.isEmpty(x)`, so that emptiness checks are idiomatic
5. As a developer, I want `x.length == 0` to be auto-fixed to `_.isEmpty(x)`, so that both equality styles are caught
6. As a developer, I want `x.length !== 0` to be auto-fixed to `!_.isEmpty(x)`, so that non-emptiness checks are idiomatic
7. As a developer, I want `x.length != 0` to be auto-fixed to `!_.isEmpty(x)`, so that both inequality styles are caught
8. As a developer, I want `x.length > 0` to be auto-fixed to `!_.isEmpty(x)`, so that the common "has items" pattern is caught
9. As a developer, I want each rule to be independently toggleable, so that I can enable/disable them per project
10. As a developer, I want all rules at severity `error`, so that CI fails on violations (but `lint:fix` clears them)
11. As a developer, I want rules to fire unconditionally without checking for `_` import, so that violations surface even in files missing the import

## Implementation Decisions

- **One rule per lodash function**: `prefer-lodash-keys`, `prefer-lodash-values`, `prefer-lodash-entries`, `prefer-lodash-isempty`. Matches existing pattern of one file per rule.
- **Shared helper for Object method rules**: A `checkObjectMethod(context, node, methodName)` helper encapsulates AST matching and fix generation for the `Object.<method>(x)` → `_.<method>(x)` transform. Each of the 3 rules keeps full scaffolding (`meta`, `create()`) and calls this helper internally. No factory pattern.
- **`prefer-lodash-isempty` is standalone**: Different AST pattern (BinaryExpression with `.length` member and `0` literal) — no code shared with the Object method rules.
- **isEmpty patterns**: Catches `=== 0`, `== 0`, `!== 0`, `!= 0`, `> 0` against `.length`. Does NOT catch variants with `1` (`< 1`, `>= 1`). Does NOT catch Yoda conditions (`0 === x.length`).
- **No edge cases**: No optional chaining (`Object.keys?.()`), no bracket notation (`Object["keys"]()`).
- **No import checking**: Rules fire unconditionally — they assume `_` is available. Consistent with existing custom rules.
- **Severity**: All rules at `error`, matching existing custom rules.
- **Registration**: All 4 rules registered in `js.js` under the `aberlaas` plugin namespace, same as existing rules.

## Testing Decisions

- All 4 rules get test files using `RuleTester` with vitest wiring (matching existing test pattern in `__tests__/`).
- Good tests verify: valid code passes, invalid code triggers the right `messageId`, autofix produces expected output.
- The 3 Object method rules each get their own test file (testing indirectly validates the shared helper).
- `prefer-lodash-isempty` gets thorough tests covering all 5 operator variants (`=== 0`, `== 0`, `!== 0`, `!= 0`, `> 0`).
- Prior art: existing tests at `__tests__/private-methods-*.js` and `__tests__/test-file-naming.js`.

## Out of Scope

- `prefer-lodash-each` (`for...of` / `for...in` → `_.each()`) — deferred due to complexity (break/continue/return/await semantics)
- Adding `_` import automatically when missing
- `Array.prototype` method replacements (`.forEach()`, `.map()`, `.filter()`)
- Yoda conditions (`0 === x.length`)
- Optional chaining or bracket notation edge cases
- Variants with `1` (`x.length < 1`, `x.length >= 1`)

## Further Notes

Test case: after implementation, running `lint:fix` on `/home/tim/local/www/worktrees/emulation--game-sync-model/lib/games/getLaptopGames.js` should auto-fix `Object.keys()` calls.
