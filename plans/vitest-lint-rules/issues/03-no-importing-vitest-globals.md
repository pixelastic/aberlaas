## TLDR

Enable the existing `vitest/no-importing-vitest-globals` plugin rule in the vitest ESLint config.

## What to build

Add `'vitest/no-importing-vitest-globals': ['error']` to the rules in `modules/lint/configs/eslint/vitest.js`. The rule is already available via the `@vitest/eslint-plugin` which is installed and registered.

No custom code needed — just one line in the config.

Note: the setup files in `modules/test/configs/setupFiles/` import from vitest (e.g. `import { expect } from 'vitest'`), but these files are outside `**/__tests__/**` so the vitest ESLint config does not apply to them.

## Acceptance criteria

- [ ] Rule `'vitest/no-importing-vitest-globals': ['error']` added to `modules/lint/configs/eslint/vitest.js`
- [ ] Lint passes on the codebase (no existing violations in test files)
