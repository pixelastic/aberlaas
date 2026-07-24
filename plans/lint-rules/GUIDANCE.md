## Guidance

- Test command: `yarn run test <filepath>`
- Lint command: `yarn run lint:fix <filepath>`
- Custom ESLint rules live in `modules/lint/configs/eslint/rules/js/`
- Tests live in `modules/lint/configs/eslint/rules/js/__tests__/`
- Rules are registered in `modules/lint/configs/eslint/js.js` (import, plugin entry, rule enable)
- Shared RuleTester helper at `modules/lint/configs/eslint/rules/helpers/ruleTester.js`
- Existing `private-methods-*` rules are the prior art — follow the same AST traversal pattern for `__ = { ... }` detection
- lodash is imported from `golgoth` (`import { _ } from 'golgoth'`)

## Discoveries
