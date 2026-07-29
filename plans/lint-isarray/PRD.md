## Problem Statement

Several native JS methods (`Object.keys`, `Object.values`, `Object.entries`, `Array.isArray`) are used inconsistently across projects. The codebase convention is to prefer lodash equivalents for these methods. Today, three separate ESLint rules enforce this for `Object.keys/values/entries`, but `Array.isArray` has no rule, and the three existing rules duplicate nearly identical logic.

## Solution

Consolidate the three existing `prefer-lodash-keys`, `prefer-lodash-values`, `prefer-lodash-entries` rules into a single `prefer-lodash-methods` rule with a declarative `from`/`to` mapping. Add `Array.isArray` -> `_.isArray` to the mapping. The rule autofixes violations.

## User Stories

1. As a developer, I want `Array.isArray(x)` flagged and autofixed to `_.isArray(x)`, so that lodash usage is consistent across the codebase.
2. As a developer, I want `Object.keys(x)` flagged and autofixed to `_.keys(x)`, so that the existing behavior is preserved after consolidation.
3. As a developer, I want `Object.values(x)` flagged and autofixed to `_.values(x)`, so that the existing behavior is preserved after consolidation.
4. As a developer, I want `Object.entries(x)` flagged and autofixed to `_.entries(x)`, so that the existing behavior is preserved after consolidation.
5. As a developer, I want a single rule to manage all "prefer lodash method" cases, so that adding a new method preference is a one-line change.
6. As a developer, I want `_.keys(x)`, `_.values(x)`, `_.entries(x)`, and `_.isArray(x)` to pass lint without errors, so that correct code is not flagged.
7. As a developer, I want unrelated methods on the same objects (e.g. `Object.freeze`, `Array.from`) to not be flagged, so that the rule does not over-reach.

## Implementation Decisions

- **Single rule replaces four files:** `prefer-lodash-keys.js`, `prefer-lodash-values.js`, `prefer-lodash-entries.js`, and `helpers/prefer-lodash-method.js` are deleted. A new `prefer-lodash-methods.js` replaces them.
- **Declarative `from`/`to` mapping:** Each entry is `{ from: 'Object.keys', to: '_.keys' }`. The rule splits on `.` to extract object and method names. This allows the `from` and `to` method names to differ.
- **Autofix:** The fixer replaces the callee object text (e.g. `Object` -> `_`, `Array` -> `_`), same strategy as the existing helper.
- **`prefer-lodash-is-empty` and `prefer-lodash-chain` stay separate:** `is-empty` matches `BinaryExpression` (`.length === 0`), not a method call. `chain` does multi-node AST rewriting. Both are structurally incompatible with the simple callee-replacement pattern.
- **Single messageId `preferLodash`** with a dynamic message per entry: e.g. "Use `_.keys()` instead of `Object.keys()`".
- **Wiring in `js.js`:** Remove 3 imports, 3 plugin entries, 3 enable lines. Add 1 of each for `prefer-lodash-methods`.

## Testing Decisions

- **What to test:** Each `from`/`to` entry must have at least one valid and one invalid test case, verifying the error is reported and the autofix produces correct output.
- **Prior art:** The existing `prefer-lodash-keys` test file uses `ruleTester.run()` with `valid`/`invalid` arrays. The consolidated test follows the same pattern but covers all entries in one file.
- **Good test = external behavior:** Test that banned code is flagged with the right messageId, that the fix output is correct, and that already-correct code passes. Do not test AST internals.

## Out of Scope

- Banning direct lodash submodule imports (`import isArray from 'lodash/isArray'`) — not a pattern used in this codebase.
- Covering destructured usage (`const { isArray } = Array`) — edge case not worth the complexity.
- Merging `prefer-lodash-is-empty` or `prefer-lodash-chain` into this rule — structurally different patterns.

## Further Notes

The `from`/`to` string convention makes it trivial to add future method preferences (e.g. `{ from: 'Object.assign', to: '_.assign' }`) without touching rule logic.
