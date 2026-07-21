## Problem Statement

When agents or developers write lodash code, they often produce nested calls
(`_.map(_.filter(arr, pred), fn)`) or chain lodash results with native methods
(`_.map(arr, fn).join(sep)`). Both patterns are harder to read than the
equivalent `_.chain()` form. There is no automated way to detect and fix these
patterns — the developer must spot them manually during review.

## Solution

A new custom ESLint rule `prefer-lodash-chain` that detects two patterns where
`_.chain()` would be more readable, reports them as errors, and provides
auto-fix to rewrite the expression as a `_.chain()` pipeline.

## User Stories

1. As a developer, I want `_.map(arr, fn).join(sep)` to be flagged, so that I rewrite it as `_.chain(arr).map(fn).join(sep).value()`
2. As a developer, I want `_.map(arr, fn).filter(pred).join(sep)` to be flagged, so that multi-step chains after a lodash call become explicit `_.chain()` pipelines
3. As a developer, I want `_.map(_.filter(arr, pred), fn)` to be flagged, so that nested lodash calls become a flat `_.chain()` pipeline
4. As a developer, I want `_.map(_.filter(_.sortBy(arr, sort), pred), fn)` to be flagged, so that deeply nested lodash calls are caught regardless of depth
5. As a developer, I want `_.map(_.filter(arr, pred), fn).join(sep)` to be flagged, so that combined nesting + post-chain patterns are caught
6. As a developer, I want each flagged expression to be auto-fixed, so that I can apply the fix with `eslint --fix` without manual rewriting
7. As a developer, I want the auto-fix for combined patterns to produce the complete correct result, so that I don't end up with broken intermediate state
8. As a developer, I want `_.map(arr, fn)` (single lodash call, nothing after) to NOT be flagged, so that simple standalone calls are left alone
9. As a developer, I want `_.chain(arr).map(fn).value()` to NOT be flagged, so that code already using `_.chain()` is accepted
10. As a developer, I want `arr.map(fn).join(sep)` to NOT be flagged, so that non-lodash chains are ignored
11. As a developer, I want `_.uniqueId().padStart(5, '0')` to be flagged, so that even lodash calls without arguments are caught when followed by a method call
12. As a developer, I want `_.map(arr, fn).length` (property access, not method call) to NOT be flagged, so that only method chains trigger the rule

## Implementation Decisions

- **Single rule, two patterns**: one ESLint rule `prefer-lodash-chain` detects both post-chain and nesting patterns. Two separate reports can fire on the same expression (one per pattern), each with a complete fix.
- **Single messageId**: one generic `preferChain` message for both patterns. No need to distinguish which pattern triggered the report in the error message.
- **Post-chain detection**: visit each `CallExpression`, walk down the callee chain to find a `_.xxx()` root. If there are intermediate method calls between the root and the current node, report.
- **Nesting detection**: visit each `CallExpression` that is a `_.xxx()` call. If the first argument is also a `_.xxx()` call, report on the outer call. Recursively unwrap for deep nesting.
- **Top-of-chain guard**: skip reporting on nodes whose result is itself the object of another method call. This avoids duplicate reports on intermediate nodes in a long chain.
- **`_.chain()` exclusion**: if walking down the chain finds a `_.chain()` call at the root, skip — the code is already using chaining.
- **No method exclusions**: all lodash methods are eligible, regardless of arity or whether they operate on collections.
- **Fix reconstruction**: build `_.chain(collection).method1(args1).method2(args2)...value()` by collecting lodash methods (from innermost to outermost for nesting) then chained methods (from first to last for post-chain).
- **Detection scope**: only `CallExpression` (method calls), not `MemberExpression` (property access like `.length`).
- **Severity**: `error`, consistent with all other `prefer-lodash-*` rules.
- **Registration**: import in `js.js`, register under `plugins.aberlaas.rules`, enable as `aberlaas/prefer-lodash-chain: ['error']`.
- **Helper function**: `isLodashCall(node)` — checks `CallExpression` with `MemberExpression` callee where `object` is `Identifier` named `_`, non-computed, with `Identifier` property.

## Testing Decisions

- Tests exercise the rule's external behavior: given input code, verify whether the rule reports or not, and if it reports, verify the exact auto-fix output.
- Use ESLint's `RuleTester` wired to vitest, same pattern as all existing rule tests in this project.
- Each test case has a descriptive `name`.
- **Valid cases**: single lodash call, already `_.chain()`, non-lodash chain, property access, non-lodash nested call.
- **Invalid cases with fix verification**: post-chain simple, post-chain multi-step, nesting simple, nesting deep, combined nesting + post-chain, lodash call without arguments + post-chain.
- Prior art: `__tests__/prefer-lodash-is-empty.js` — similar structure with valid/invalid split and `output` verification.

## Out of Scope

- **Cross-statement patterns**: detecting `const x = _.filter(arr, pred); _.map(x, fn)` across two statements. Requires data-flow analysis, too complex and fragile for a deterministic lint rule.
- **Property access chains**: `_.map(arr, fn).length` — not a method call, semantic mismatch with chaining (would need `.size()` which changes meaning).
- **Method allowlists/blocklists**: no filtering by lodash method name. All methods treated uniformly.
- **Scope analysis**: no verification that `_` actually refers to lodash (consistent with existing rules).
