## Problem Statement

The 13 custom ESLint rules in aberlaas are all registered as a single `aberlaas` plugin inside `js.js`, but some rules are only activated in `vitest.js`. This creates cross-file coupling: `vitest.js` references rules that only exist because `js.js` registered them. Loading vitest config without js config would break. Each config should be self-contained — defining, registering, and activating its own rules — so that any config can be loaded independently and any rule group can be deleted cleanly.

## Solution

Split the monolithic `aberlaas` plugin into two self-contained plugins:

- **`aberlaas`** (inline in `js.js`) — 10 general-purpose rules (lodash, private-methods, naming, test-file-naming)
- **`aberlaas-test`** (inline in `vitest.js`) — 3 test-specific rules (mock cleanup, mock return value, expect-to-have-property)

Each plugin is defined inline in its config file. Rule files are relocated into domain subdirectories (`rules/js/`, `rules/test/`) so deleting a plugin means deleting a directory and removing a block from one config file.

## User Stories

1. As a maintainer, I want each config file to be self-contained, so that loading `vitest.js` without `js.js` doesn't break
2. As a maintainer, I want test-specific rules grouped under `aberlaas-test`, so that the namespace signals which rules are test-only
3. As a maintainer, I want rule files organized in domain subdirectories, so that I can delete an entire rule group by removing one directory
4. As a maintainer, I want the lodash helper to live inside `rules/js/helpers/`, so that it's colocated with the rules that use it
5. As a maintainer, I want a shared `rules/helpers/` directory available for cross-plugin helpers, so that future shared utilities have a home
6. As a maintainer, I want the deprecated `context.getSourceCode()` fallback removed, so that rule files use the standard ESLint 9 API
7. As a maintainer, I want `prefer-expect-to-have-property` moved to vitest config, so that it only runs on test files where `expect()` is used
8. As a maintainer, I want `test-file-naming` to stay in js config, so that it can catch `.test.`/`.spec.` suffixed files anywhere in the project via the broad glob
9. As a maintainer, I want existing tests to be relocated alongside their rule files, so that tests stay colocated with the code they verify
10. As a maintainer, I want no new abstractions like `createRule()`, so that each rule file remains self-explanatory without indirection

## Implementation Decisions

### Two plugins, inline in config files

- `aberlaas` plugin defined inline in `js.js` with 10 rules
- `aberlaas-test` plugin defined inline in `vitest.js` with 3 rules
- No separate `plugin.js` files — each config owns its plugin entirely

### Rule assignment

**`aberlaas` (js.js) — 10 rules:**
- no-abbreviated-names
- prefer-lodash-chain, prefer-lodash-entries, prefer-lodash-is-empty, prefer-lodash-keys, prefer-lodash-values
- private-methods-no-rename, private-methods-no-wrapper, private-methods-ordering
- test-file-naming

**`aberlaas-test` (vitest.js) — 3 rules:**
- no-manual-mock-cleanup
- prefer-mock-return-value
- prefer-expect-to-have-property

### Directory layout

```
rules/
├── helpers/          ← shared across plugins (empty initially)
├── js/
│   ├── helpers/
│   │   └── prefer-lodash-method.js
│   ├── __tests__/    ← tests for js rules
│   └── (10 rule files)
└── test/
    ├── __tests__/    ← tests for test rules
    └── (3 rule files)
```

### sourceCode compat cleanup

Replace `context.sourceCode || context.getSourceCode()` with `context.sourceCode` in all rule files. The project uses ESLint 9.39.2 where `context.sourceCode` is the standard API.

### No createRule() helper

Each rule keeps its own full meta/create structure. The boilerplate savings (~2 lines per file) don't justify the added indirection for 13 rules.

## Testing Decisions

- No new tests are needed — this is a structural refactor with no logic changes
- All 13 existing rule test files must be relocated into the correct `__tests__/` subdirectory under `rules/js/` or `rules/test/`
- The `vitest-config.js` test file stays in its current location (it tests the vitest config, not a rule)
- Test imports must be updated to match the new rule file paths
- All existing tests must pass after the migration

### Test relocation mapping

**To `rules/js/__tests__/`:** no-abbreviated-names, prefer-lodash-chain, prefer-lodash-entries, prefer-lodash-is-empty, prefer-lodash-keys, prefer-lodash-values, private-methods-no-rename, private-methods-no-wrapper, private-methods-ordering, test-file-naming

**To `rules/test/__tests__/`:** no-manual-mock-cleanup, prefer-mock-return-value, prefer-expect-to-have-property

## Out of Scope

- Splitting into separate npm packages — both plugins stay in the same module
- Renaming rules themselves (only the namespace prefix changes for 3 rules)
- Adding new rules or modifying rule logic
- Changes to react.js, vue.js, json.js, scripts.js, or docs.js configs
- A shared `createRule()` helper

## Further Notes

The `rules/helpers/` shared directory will start empty. It exists as a convention for future cross-plugin helpers. If git doesn't track empty directories, a `.gitkeep` can be added, or the directory can be created when the first shared helper is needed.
