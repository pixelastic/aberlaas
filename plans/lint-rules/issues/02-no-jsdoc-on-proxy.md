## TLDR

New custom rule `private-methods-no-jsdoc-on-proxy` that flags and autofixes JSDoc on shorthand proxies in `__ = { ... }`.

## What to build

Create a new ESLint rule at `modules/lint/configs/eslint/rules/js/private-methods-no-jsdoc-on-proxy.js`.

**Detection logic:** In `__ = { ... }` assignment expressions, for each shorthand `Property` node, check leading comments via `sourceCode.getCommentsBefore()`. Flag comments that:
1. Start with `/**` (block comment, value begins with `*`)
2. Contain at least one line matching `/^\s*\*\s+@\w+/m` (a `@tag` at the start of a comment line)

**Autofix:** Remove the entire comment block.

**Rule metadata:**
- type: `suggestion`
- fixable: `code`
- messageId: `noJsdocOnProxy`
- message: `"Shorthand proxies do not require documentation"`

Register the rule in `modules/lint/configs/eslint/js.js`:
- Import the rule module
- Add to `plugins.aberlaas.rules`
- Enable at `error` level

## Behavioral Tests

Tests in `modules/lint/configs/eslint/rules/js/__tests__/private-methods-no-jsdoc-on-proxy.js` using the shared `RuleTester` helper.

**Valid cases (no error reported):**
- Shorthand proxy without any comment
- Shorthand proxy with a plain `/** explanation */` comment (no `@tag`)
- Shorthand proxy with a `//` line comment
- Non-shorthand property (method definition) with JSDoc — allowed
- Non-shorthand property (arrow function) with JSDoc — allowed
- Comment containing `@` mid-line, not at line start (e.g. `* Given by @someone`)

**Invalid cases (error reported + autofix):**
- Shorthand proxy with `/** @param {string} name */` — reports, autofix removes comment
- Shorthand proxy with multi-line JSDoc containing `* @returns {boolean}` — reports, autofix removes comment

## Acceptance criteria

- [ ] Rule file created following existing `private-methods-*` rule patterns
- [ ] Rule detects JSDoc (starting with `/**`, containing `@tag` at line start) on shorthand properties in `__ = { ... }`
- [ ] Rule ignores plain comments, line comments, and `@` mid-line
- [ ] Rule ignores non-shorthand properties (methods, arrow functions)
- [ ] Autofix removes the flagged JSDoc comment
- [ ] Rule registered in `js.js` (import, plugin, enabled at error)
- [ ] All test cases pass
- [ ] Lint passes on the entire `modules/lint` directory
