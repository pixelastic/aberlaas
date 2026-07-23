## TLDR

Replace `context.sourceCode || context.getSourceCode()` with `context.sourceCode` in all rule files.

## What to build

Search all rule files for the `context.sourceCode || context.getSourceCode()` fallback pattern and replace with `context.sourceCode`. The project uses ESLint 9.39.2 where `context.sourceCode` is the standard API — the `getSourceCode()` fallback is dead code.

## Scaffolding Tests

- No rule file contains the string `getSourceCode`

## Acceptance criteria

- [ ] All occurrences of `context.getSourceCode()` removed
- [ ] Replaced with direct `context.sourceCode` usage
- [ ] All existing tests pass
