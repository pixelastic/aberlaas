## Problem Statement

Tests use `expect(actual.foo).toEqual(bar)` instead of
`expect(actual).toHaveProperty('foo', bar)`. The dot-access pattern produces
worse failure messages (shows only the value, not which property failed) and
breaks the project's assertion convention.

## Solution

Add a custom ESLint rule `prefer-expect-to-have-property` to the aberlaas
`aberlaas` plugin. The rule detects member expressions inside `expect()` and
auto-fixes them to use `toHaveProperty`.

## User Stories

1. As a developer, I want `expect(actual.foo).toEqual(bar)` to be auto-fixed to `expect(actual).toHaveProperty('foo', bar)`, so that test failures show the property name
2. As a developer, I want `expect(actual.foo).toBe(bar)` to be auto-fixed the same way, so that the convention is enforced regardless of matcher choice
3. As a developer, I want `expect(actual.foo).toBeDefined()` to be auto-fixed to `expect(actual).toHaveProperty('foo')`, so that existence checks follow the convention
4. As a developer, I want `expect(actual.foo.bar).toEqual(baz)` to produce `expect(actual).toHaveProperty('foo.bar', baz)`, so that nested property paths are handled
5. As a developer, I want `expect(actual['foo']).toEqual(bar)` to be treated like dot access, so that bracket notation with string literals is also covered
6. As a developer, I want `expect(actual[key]).toEqual(bar)` to produce `expect(actual).toHaveProperty(key, bar)`, so that computed property access is also covered
7. As a developer, I want `expect(actual[key].foo).toBe(bar)` to produce `expect(actual).toHaveProperty([key, 'foo'], bar)`, so that mixed chains use array format
8. As a developer, I want the rule to ignore method calls in the chain like `expect(actual.foo().bar)`, so that only pure property access is flagged
9. As a developer, I want the rule to ignore `.not` chains, so that semantically ambiguous negations are left alone
10. As a developer, I want the rule to ignore `resolves`/`rejects` chains, so that async assertions are left alone
11. As a developer, I want the rule to ignore matchers not in the handled list (toContain, toHaveLength, etc.), so that only safe auto-fixes are applied
12. As a developer, I want the rule enabled as `error` in the eslint config, so that violations fail CI

## Implementation Decisions

- **Rule module** (`prefer-expect-to-have-property`): single file, no helper extraction needed. Contains the AST visitor, path extraction, and fixer logic.
- **Registration**: import and register in the `aberlaas` plugin object in the JS eslint config, enable as `['error']` alongside existing custom rules.
- **AST strategy**: visit `CallExpression` nodes. Check if the callee chain is `expect(memberExpr).matcher(args)`. Extract the member expression chain from the `expect()` argument.
- **Matchers handled**: `toEqual`, `toBe` (with auto-fix to `toHaveProperty(path, val)`), `toBeDefined` (with auto-fix to `toHaveProperty(path)`).
- **Matchers ignored**: `toStrictEqual`, `toBeUndefined`, `toContain`, `toHaveLength`, `toMatchObject`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, and all others.
- **Property path format**: string (`'foo.bar'`) when all segments are static (identifiers or string literals). Array (`[key, 'foo']`) only when a computed variable is present in the chain.
- **Chains ignored**: `.not`, `.resolves`, `.rejects`, method calls in the member expression.
- **Scope**: any member expression inside `expect()`, not restricted to a specific variable name.

## Testing Decisions

- Test the rule module using ESLint's `RuleTester` wired to vitest, matching the pattern used by all existing custom rules in the project.
- Good tests cover external behavior: valid code that should pass, invalid code that should be flagged, and expected auto-fix output.
- Test cases should cover: dot access, nested dot access, bracket string literal, bracket variable, mixed chain (array format), `toBeDefined`, `toBe`, `toEqual`, and all ignore cases (`.not`, `.resolves`, method calls, unhandled matchers, no member expression).
- Prior art: `__tests__/prefer-lodash-is-empty.js` in the same directory.
- No tests for the registration/config wiring (module 2).

## Out of Scope

- `toStrictEqual` — intentionally excluded; if someone uses strict equal they want stricter semantics than `toHaveProperty` provides
- `toBeUndefined` — excluded due to semantic gap with `not.toHaveProperty`
- `.not` chain handling — ambiguous semantics
- `resolves`/`rejects` chain handling
- Matchers without clean `toHaveProperty` mapping (toContain, toHaveLength, etc.)
- Refactoring test-only rules out of js.js into vitest.js — separate initiative
- Auto-fixing method calls in the expect argument chain
