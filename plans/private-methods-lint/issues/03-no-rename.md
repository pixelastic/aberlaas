## TLDR

ESLint rule that warns on renamed identifier references in `__ = { ... }` (no autofix).

## What to build

Create `modules/lint/configs/eslint/rules/private-methods-no-rename.js`.

The rule visits `AssignmentExpression` nodes where `left.name === '__'` and `right` is an `ObjectExpression`. For each property, check if it's a non-computed, non-shorthand property where both key and value are identifiers with different names.

**Warn (no autofix):** report `Use shorthand \`valueName,\` instead`.

## Behavioral Tests

Create `modules/lint/configs/eslint/__tests__/private-methods-no-rename.js`.

**Invalid cases (warn):**
- Renamed identifier `{ readGamelist: readRemoteGamelist }` reports correct message

**Valid cases:**
- Same-name shorthand property is not flagged
- Arrow function value is not flagged
- Call expression value is not flagged
- Computed property with different identifier is not flagged
- Properties outside `__ = { ... }` are not flagged

## Acceptance criteria

- [ ] Rule file exists at `modules/lint/configs/eslint/rules/private-methods-no-rename.js`
- [ ] Rule exports `{ meta, create }` in ESM
- [ ] Renamed identifiers warn with correct message, no autofix
- [ ] Non-identifier values (arrows, calls) are not flagged
- [ ] All test cases pass
