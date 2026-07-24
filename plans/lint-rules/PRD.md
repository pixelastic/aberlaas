## Problem Statement

The codebase has two unguarded patterns that lead to inconsistency and wasted effort: developers can use `Set`/`WeakSet` (which offer no real benefit over arrays for the always-small collections in this codebase), and JSDoc comments can accumulate on shorthand proxies inside `__ = { ... }` blocks (duplicating the documentation of the original function).

## Solution

Add two new ESLint rules to aberlaas's custom lint config:

1. Ban `Set` and `WeakSet` usage via `no-restricted-syntax` selectors.
2. A new custom rule `private-methods-no-jsdoc-on-proxy` that flags and autofixes JSDoc on shorthand properties in `__ = { ... }`.

## User Stories

1. As a developer, I want ESLint to flag `new Set()` and `new WeakSet()`, so that I use arrays consistently across the codebase.
2. As a developer, I want ESLint to flag `Set()` and `WeakSet()` called without `new`, so that no Set sneaks in through alternate syntax.
3. As a developer, I want ESLint to flag `Set.from()` and `WeakSet.prototype` (member expressions), so that Set-related APIs are fully banned.
4. As a developer, I want the Set ban to apply to the lint rules themselves, so that the tooling dogfoods its own standards.
5. As a developer, I want ESLint to flag JSDoc comments on shorthand proxies in `__ = { ... }`, so that documentation isn't duplicated from the original function.
6. As a developer, I want the JSDoc rule to autofix by removing the flagged comment, so that I can batch-fix violations without manual edits.
7. As a developer, I want the JSDoc rule to only flag comments that start with `/**` and contain a `@tag` at the start of a line, so that plain explanatory comments are still allowed on proxies.
8. As a developer, I want the JSDoc rule to leave non-shorthand properties (methods, arrow functions) in `__` alone, so that new logic keeps its documentation.
9. As a developer, I want the JSDoc rule to follow the same conventions as the three existing `private-methods-*` rules (registration, testing, error level), so that the codebase stays consistent.

## Implementation Decisions

- **Set/WeakSet ban uses `no-restricted-syntax`**, not a custom rule. Six selectors: `NewExpression`, `CallExpression`, and `MemberExpression` for both `Set` and `WeakSet`. Message: `"Use arrays; use _.uniq() for deduplication"`.
- **`instanceof Set` / `instanceof WeakSet` are NOT caught.** The selectors cover construction and API access, not type checks.
- **Bare `Identifier[name='Set']` is NOT caught.** Too broad; would false-positive in comments and unrelated variable names.
- **Three existing rule files that use `new Set()` will be refactored** to use arrays with `.includes()` instead, dogfooding the new restriction.
- **New custom rule `private-methods-no-jsdoc-on-proxy`** follows the same pattern as the three existing `private-methods-*` rules: same AST traversal of `__ = { ... }` assignment expressions, same plugin registration, same error level.
- **JSDoc detection criteria:** the comment starts with `/**` AND contains at least one line matching `/^\s*\*\s+@\w+/m` (a `@tag` at the start of a comment line, not mid-sentence).
- **Autofix:** the rule removes the entire comment block (including leading whitespace/newline).
- **messageId:** `noJsdocOnProxy`. **Message:** `"Shorthand proxies do not require documentation"`.
- **Rule type:** `suggestion`, fixable: `code`.

## Testing Decisions

- **Only the new custom rule (`private-methods-no-jsdoc-on-proxy`) gets new tests.** The Set ban uses a core ESLint rule (no custom logic to test). The Set refactor in existing files is covered by their existing test suites.
- **Good tests exercise the rule's external behavior:** given source code input, does the rule report/not-report, and does the fix produce the expected output?
- **Prior art:** the three existing `private-methods-*` test files in `rules/js/__tests__/`, all using the shared `RuleTester` helper wired to Vitest.
- **Test cases for the new rule:**
  - Valid: shorthand proxy without any comment
  - Valid: shorthand proxy with a plain `/** explanation */` comment (no `@tag`)
  - Valid: shorthand proxy with a `//` line comment
  - Valid: non-shorthand property (method) WITH JSDoc (allowed)
  - Valid: non-shorthand property (arrow function) WITH JSDoc (allowed)
  - Valid: comment with `@` mid-line (not at line start)
  - Invalid: shorthand proxy with `/** @param ... */` — reports + autofix removes comment
  - Invalid: shorthand proxy with multi-line JSDoc containing `@returns` — reports + autofix removes comment

## Out of Scope

- Restricting `instanceof Set` / `instanceof WeakSet`.
- Catching `Set` used as a bare identifier (e.g. `const x = Set`).
- Autofix for the Set ban (no sensible mechanical replacement exists).
- Enforcing JSDoc presence on non-shorthand properties in `__` (a separate concern).
- Any changes outside the `modules/lint` module.
