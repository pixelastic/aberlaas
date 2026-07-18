## TLDR

Run the new rules against the aberlaas codebase and fix any violations.

## What to build

Run a full lint pass on the aberlaas codebase with the 3 new rules enabled. Review each violation:

- Apply autofixes where available (no-wrapper same-name, ordering).
- Manually fix warnings (no-wrapper different-name, no-rename) after confirming the correct shorthand name.
- Verify the codebase still passes all tests after fixes.

This is a HITL issue — the developer must review each fix to confirm correctness.

## Acceptance criteria

- [ ] Full lint pass runs clean with the 3 new rules
- [ ] All autofixes applied and verified
- [ ] All warnings resolved manually
- [ ] Test suite passes after fixes
