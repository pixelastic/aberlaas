## Problem Statement

Testing conventions (no vitest imports, no manual mock cleanup, prefer mockReturnValue over mockResolvedValue) are documented in prose but not enforced by tooling. Agents forget prose rules; a linter doesn't.

## Solution

Add three ESLint rules to the vitest config so violations are caught at lint time:

1. Enable the existing `vitest/no-importing-vitest-globals` plugin rule
2. Create a custom `aberlaas/prefer-mock-return-value` rule with autofix
3. Create a custom `aberlaas/no-manual-mock-cleanup` rule (no autofix, educational message only)

Migrate existing violations in the aberlaas codebase.

## User Stories

1. As a developer running lint, I want mockResolvedValue/mockRejectedValue calls to be auto-fixed to mockReturnValue, so that mock setup stays synchronous without manual intervention
2. As a developer running lint, I want to see an error when I call vi.restoreAllMocks(), explaining that vitest is already configured with restoreMocks: true, so that I understand why the call is unnecessary
3. As a developer running lint, I want to see an error when I call vi.clearAllMocks(), explaining that vitest is already configured with clearMocks: true, so that I understand why the call is unnecessary
4. As a developer running lint, I want to see an error when I call vi.resetAllMocks(), explaining that vitest is already configured with restoreMocks: true, so that I understand why the call is unnecessary
5. As a developer, I want to be able to disable prefer-mock-return-value on a specific line if I have a legitimate reason, without disabling unrelated rules
6. As a developer, I want to be able to disable no-manual-mock-cleanup on a specific line if I have a legitimate reason, without disabling unrelated rules
7. As a developer importing describe/it/expect/vi from vitest, I want lint to tell me the import is redundant, so that I remove it and rely on globals
8. As an agent writing tests, I want lint errors with actionable messages that explain what to do instead, so that I can fix violations without needing external documentation

## Implementation Decisions

- Two custom ESLint rules, registered in the `aberlaas` plugin (in `js.js`) alongside existing custom rules, but activated only in the vitest config (in `vitest.js`)
- `prefer-mock-return-value`: AST visitor on `MemberExpression` nodes. Checks `property.name` against a map of banned methods to their replacements (`mockResolvedValue` -> `mockReturnValue`, `mockResolvedValueOnce` -> `mockReturnValueOnce`, `mockRejectedValue` -> `mockReturnValue`, `mockRejectedValueOnce` -> `mockReturnValueOnce`). Provides autofix by renaming the property. Message: "Use mockReturnValue() instead" or "Use mockReturnValueOnce() instead" depending on the variant
- `no-manual-mock-cleanup`: AST visitor on `CallExpression` nodes. Matches calls where callee is a `MemberExpression` with `object.name === 'vi'` and `property.name` in `{restoreAllMocks, clearAllMocks, resetAllMocks}`. No autofix. Three distinct messages:
  - restoreAllMocks: "No need to manually restore mocks, vitest is already configured with restoreMocks: true"
  - clearAllMocks: "No need to manually clear mocks, vitest is already configured with clearMocks: true"
  - resetAllMocks: "No need to manually reset mocks, vitest is already configured with restoreMocks: true"
- `vitest/no-importing-vitest-globals`: existing plugin rule, just needs `['error']` in vitest.js rules
- Migration: 5 `mockResolvedValue` calls across 4 test files replaced with `mockReturnValue`

## Testing Decisions

- Both custom rules are tested in isolation using ESLint's `RuleTester`, wired to vitest globals — the same pattern used by existing custom rules (e.g. `test-file-naming`, `prefer-expect-to-have-property`)
- Good tests cover: valid code that should not trigger the rule, invalid code that should trigger it with the correct messageId, and autofix output where applicable
- `prefer-mock-return-value` tests: valid cases with `mockReturnValue`/`mockReturnValueOnce`/`mockImplementation`; invalid cases for each of the 4 banned methods, verifying messageId and fix output
- `no-manual-mock-cleanup` tests: valid cases with unrelated `vi.*` calls; invalid cases for each of the 3 banned methods, verifying the correct messageId per method
- Config wiring and migration are verified by running `yarn run lint:fix` on the migrated files
- Prior art: `modules/lint/configs/eslint/__tests__/test-file-naming.js`

## Out of Scope

- Removing the corresponding bullets from the js-writer skill's `testing.md` (separate step, after this lands)
- Adding `resetMocks: true` to the vitest config (not needed since `restoreMocks: true` already covers it)
- Banning other vitest mock methods beyond the ones specified
- Providing autofix for `no-manual-mock-cleanup` (intentionally omitted so the error message is seen and understood)
