## TLDR

ESLint rule that detects verbose wrappers in `__ = { ... }` and autofixes to shorthand when key matches callee.

## What to build

Create `modules/lint/configs/eslint/rules/private-methods-no-wrapper.js`.

The rule visits `AssignmentExpression` nodes where `left.name === '__'` and `right` is an `ObjectExpression`. For each property, check if the body is a single `return fn(sameArgs)` (including `return await fn(sameArgs)`).

**Autofix** (key === callee name): replace the property with a shorthand property.

**Warn only** (key !== callee name): report `Use shorthand \`calleeName,\` instead`.

Must handle: method syntax, arrow syntax, async methods, async arrows, `return await`, zero-param and multi-param variants.

Must ignore: multi-statement bodies, value-to-function adapters (`() => value` where return is not a call expression), properties outside `__ = { ... }`.

## Behavioral Tests

Create `modules/lint/configs/eslint/__tests__/private-methods-no-wrapper.js`.

**Invalid cases (same name — autofix):**
- Method syntax wrapper autofixes to shorthand
- Arrow syntax wrapper autofixes to shorthand
- Async method wrapper autofixes to shorthand
- `return await` wrapper autofixes to shorthand
- Zero-param wrapper autofixes to shorthand

**Invalid cases (different name — warn):**
- Different-name method wrapper reports correct message
- Different-name arrow wrapper reports correct message

**Valid cases:**
- Multi-statement body is not flagged
- Value-to-function adapter `() => value` is not flagged
- Properties outside `__ = { ... }` are not flagged
- Shorthand property is not flagged
- Non-wrapper arrow (different args) is not flagged

## Acceptance criteria

- [ ] Rule file exists at `modules/lint/configs/eslint/rules/private-methods-no-wrapper.js`
- [ ] Rule exports `{ meta, create }` in ESM, following `test-file-naming.js` structure
- [ ] Same-name wrappers are autofixed to shorthand
- [ ] Different-name wrappers warn with correct message, no autofix
- [ ] Value-to-function adapters are ignored
- [ ] All test cases pass
