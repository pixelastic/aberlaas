## TLDR

ESLint rule that enforces shorthand properties come after non-shorthand in `__ = { ... }`, with autofix.

## What to build

Create `modules/lint/configs/eslint/rules/private-methods-ordering.js`.

The rule visits `AssignmentExpression` nodes where `left.name === '__'` and `right` is an `ObjectExpression`. It checks whether any shorthand property appears before a non-shorthand property.

**Autofix:** partition properties into non-shorthand and shorthand groups, rewrite the object with non-shorthands first, shorthands last, preserving relative order within each group. Use source text to preserve comments attached to properties.

## Behavioral Tests

Create `modules/lint/configs/eslint/__tests__/private-methods-ordering.js`.

**Invalid cases (autofix):**
- Single shorthand before a method → autofixes to correct order
- Multiple mixed shorthands → preserves relative order within each group

**Valid cases:**
- Already correct order (methods first, shorthands last)
- All non-shorthand properties
- All shorthand properties
- Properties outside `__ = { ... }` are not flagged

## Acceptance criteria

- [ ] Rule file exists at `modules/lint/configs/eslint/rules/private-methods-ordering.js`
- [ ] Rule exports `{ meta, create }` in ESM
- [ ] Shorthand before non-shorthand triggers an error with autofix
- [ ] Autofix preserves relative order within each group
- [ ] All test cases pass
